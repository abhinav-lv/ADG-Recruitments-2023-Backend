const getElapsedTime = (time1, time2) => {
    // return [ minutes, seconds ]
    const elapsedTime = time2-time1
    const minutes = Math.floor(elapsedTime/1000/60)
    const seconds = Math.floor((elapsedTime/1000/60 - minutes)*60)
    return [minutes, seconds]
}

const startTest = (req,res) => {
    if(!req.session.user){
        res.status(403).send('No user session')
        return
    }
    req.session.user.test = {
        ...req.session.user.test,
        isTakingTest: true, 
        testStartedAt: new Date().toString()
    }
    res.status(200).send('Test started')
}

const endTest = (req,res) => {
    if(!req.session.user){
        res.status(403).send('No user session')
        return
    }
    const time1 = new Date(req.session.user.test.testStartedAt)
    const time2 = new Date()
    res.status(200).send(getElapsedTime(time1, time2))
}

module.exports = {startTest,endTest}

/*

    const time1 = new Date("May 23, 2023 23:52:17")
    const time2 = new Date("May 24, 2023 00:03:08")

    const elapsedTime = time2-time1;
    const minutes = Math.floor(elapsedTime/1000/60)
    const seconds = Math.floor((elapsedTime/1000/60 - minutes)*60)
    console.log('Minutes: ', minutes)
    console.log('Seconds: ', seconds)

*/