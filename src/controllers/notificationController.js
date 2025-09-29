const notificationService = require('../services/notificationService');

exports.send = async(req, res, next) => {
    try {
        const { message, receiver_id } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });    
        const senderId = req.user.sub;
        if (!receiver_id) {
            const {count} = await notificationService.sendAllVolunteer(senderId, message);
            return res.status(201).json({ ok: true, broadcast: true, count });
        } else{
            await notificationService.sendToUser(senderId, message, receiver_id);
            return res.status(201).json({ ok: true});
        }
    } catch (err) {
        next(err);
    }
}

exports.get = async(req, res, next) => {
    try {
        const data = await notificationService.get(req.user.sub);
        res.status(201).json({data});
    } catch (err) {
        next(err)
    }
}

exports.read = async(req, res, next) => {
    try {
        const { id } = req.params;
        const receiver_id  =  req.user.sub;
        await notificationService.readNotification(id, receiver_id);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
}