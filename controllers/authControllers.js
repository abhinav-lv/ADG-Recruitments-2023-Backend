const User = require('../models/User')

const getElapsedTime = (time1, time2) => {
    // return [ minutes, seconds ]
    const elapsedTime = time2-time1
    const minutes = Math.floor(elapsedTime/1000/60)
    const seconds = Math.floor((elapsedTime/1000/60 - minutes)*60)
    return [minutes, seconds]
}

const authenticateUser = async (req,res) => {
    try{
        const userExists = await User.findOne({'regNo': `${req.body.regNo}`})
        if(!userExists) res.status(403).send('User not found in database, not part of ADG')
        else{
            if(userExists.password !== req.body.password){
                res.status(403).send('Invalid password')
                return
            }
            // console.log(userExists.timeLeftToAttempt)
            req.session.regenerate((err) => {
                if(err) console.error(err)
                
                req.session.user = {
                    regNo: userExists.regNo, 
                    yearOfStudy: userExists.yearOfStudy,
                    attemptedDomains: JSON.parse(userExists.attempted),
                    test: {
                        isTakingTest: false, 
                        testStartedAt: '', 
                        remainingTime: JSON.stringify(userExists.timeLeftToAttempt),
                        testDetails: {}
                    }
                }
                res.status(200).send(req.session.user)
            })
        }
    }
    catch(error) {
        console.error(error.message)
        res.status(401).send('An error occurred when trying to authenticate user.')
    }
}

const authorizeUser = (req,res) => {
    if(!req.session.user) res.status(403).send('No user session')
    else{
        // console.log(req.session.user)
        res.status(200).send(req.session.user)
    }
}

const logUserOut = async (req,res) => {
    if(req.session.user){
        try{
            if(req.session.user.test.isTakingTest){

                // Calculate remaining time
                const time1 = new Date(req.session.user.test.testStartedAt)
                const time2 = new Date()
                const elapsedTime = getElapsedTime(time1, time2)
                const remainingTime = JSON.parse(req.session.user.test.remainingTime)

                if(remainingTime[1] < elapsedTime[1]){
                    remainingTime[0] -= (elapsedTime[0]+1)
                    remainingTime[1] = remainingTime[1]-elapsedTime[1]+60
                }
                else{
                    remainingTime[0] -= elapsedTime[0]
                    remainingTime[1] -= elapsedTime[1]
                }

                const user = await User.findOne({regNo: req.session.user.regNo})
                const attempted = JSON.parse(user.attempted)
                const {subdomain} = req.session.user.test.testDetails
                attempted[`${subdomain}`] = true
                await User.updateOne({regNo: user.regNo},
                    {$set: {attempted: JSON.stringify(attempted), timeLeftToAttempt: remainingTime}})    
            }
            else{
                const time = JSON.parse(req.session.user.test.remainingTime)
                await User.updateOne({regNo: `${req.session.user.regNo}`},
                {$set: {timeLeftToAttempt: time}})
                // console.log(user)
            }
        }
        catch(err){
            console.error(err)
        }
    }

    req?.session.destroy((err) => {
        if(err) next(err)
        res.clearCookie('connect.sid')
        res.status(200).send('User logged out.')
    })
}

module.exports = { authenticateUser, authorizeUser, logUserOut }