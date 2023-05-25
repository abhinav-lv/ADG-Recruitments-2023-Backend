const User = require('../models/User')

const getElapsedTime = (time1, time2) => {
    // return [ minutes, seconds ]
    const elapsedTime = time2-time1
    const minutes = Math.floor(elapsedTime/1000/60)
    const seconds = Math.floor((elapsedTime/1000/60 - minutes)*60)
    return [minutes, seconds]
}

// ---------------------------------------------------------------------------------------------------------------------------------------

// Receive user responses for a test
const getResponses = async (req,res) => {
    if(!req.session.user){
        res.status(403).send('Unauthorized')
        return
    }
    else{
        try{
            // Find user in databse
            const user = await User.findOne({regNo: req.session.user.regNo})
            const { subdomain } = req.body
            
            // Update responses in database and tag attempted domain
            const response = JSON.stringify(req.body)
            const responses = user.responses
            const attempted = JSON.parse(user.attempted)
            const newResponses = [...responses, response]
            attempted[`${subdomain}`] = true

            // Save to database
            await User.updateOne({regNo: user.regNo}, {$set: {responses: newResponses, attempted: JSON.stringify(attempted)}})

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

            // Update session object
            req.session.user.attemptedDomains = attempted
            req.session.user.test = {
                isTakingTest: false,
                testStartedAt: '',
                remainingTime: JSON.stringify(remainingTime)
            }

            // Send response back
            res.status(200).send({message: 'Responses received', time: getElapsedTime(time1,time2)})
        }
        catch(err){
            console.error(err)
            res.status(400).send('An error occurred when storing responses')
        }
    }
}

module.exports = { getResponses }