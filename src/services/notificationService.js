const roles = require('../constants/roles');
const { NotFoundError } = require('../errors/errorTypes');
const { User, Notification } = require('../models');

exports.sendAllVolunteer = async (senderId, message) => {
    const volunteers = await User.findAll({
        attributes: ['id'],
        where: { role: roles.VOLUNTEER, is_active: true },
        raw: true,
    });

    const notifications = volunteers.map(v => ({
        sender_id: senderId,
        receiver_id: v.id,
        message,
    }));

    await Notification.bulkCreate(notifications);

    return {count: volunteers.length};
}

exports.sendToUser = async(senderId, message, receiver_id) => {
    await Notification.create({
      sender_id: senderId,
      receiver_id,
      message,
    });
}

exports.get = async(receiver_id) => {
    const notifications = await Notification.findAll({
      where: { receiver_id },
      attributes: ['id', 'message', 'is_read', 'created_at'],
      include: {
        model: User,
        as: 'sender',
        attributes: ['name'],
      },
      order: [['created_at', 'DESC']],
    });

    return data = notifications.map(n => ({
      id: n.id,
      message: n.message,
      is_read: n.is_read,
      created_at: n.created_at,
      sender_name: n.sender.name,
    }));
}

exports.readNotification = async(id, receiver_id) => {
    const [affectedRows] = await Notification.update(
      { is_read: true },
      { where: { id, receiver_id } }
    );

    if (!affectedRows) {
      throw new NotFoundError('Notification not found');
    }
}