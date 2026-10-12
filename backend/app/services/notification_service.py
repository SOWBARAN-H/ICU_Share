from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

def format_notification(n: Notification) -> NotificationResponse:
    delta = datetime.utcnow() - n.created_at
    minutes = int(delta.total_seconds() / 60)
    if minutes < 2:
        time_ago = "Just now"
    elif minutes < 60:
        time_ago = f"{minutes} mins ago"
    else:
        hours = int(minutes / 60)
        time_ago = f"{hours} hr ago" if hours == 1 else f"{hours} hrs ago"

    return NotificationResponse(
        id=n.id,
        user_id=n.user_id,
        hospital_id=n.hospital_id,
        booking_id=n.booking_id,
        title=n.title,
        message=n.message,
        type=n.type,
        ref=n.ref,
        is_read=n.is_read,
        timeAgo=time_ago,
        created_at=n.created_at
    )

def get_user_notifications(db: Session, user_id: Optional[int] = None) -> List[NotificationResponse]:
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    else:
        # If demo mode without user ID, return recent user-targeted notifications
        query = query.filter(Notification.hospital_id.is_(None) | (Notification.type.in_(["confirmed", "unavailable", "info"])))
    
    notifs = query.order_by(Notification.created_at.desc()).all()
    return [format_notification(n) for n in notifs]

def get_hospital_notifications(db: Session, hospital_id: str) -> List[NotificationResponse]:
    notifs = db.query(Notification).filter(
        Notification.hospital_id == hospital_id,
        Notification.type.in_(["incoming", "critical", "warning", "surge"])
    ).order_by(Notification.created_at.desc()).all()
    return [format_notification(n) for n in notifs]

from app.services.websocket_manager import ws_manager

def mark_all_user_read(db: Session, user_id: Optional[int] = None):
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    else:
        query = query.filter(Notification.type.in_(["confirmed", "unavailable", "info"]))
    query.update({Notification.is_read: True})
    db.commit()
    ws_manager.broadcast_sync("NOTIFICATIONS_UPDATED", {"portal": "user", "user_id": user_id})

def clear_user_notifs(db: Session, user_id: Optional[int] = None):
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    else:
        query = query.filter(Notification.type.in_(["confirmed", "unavailable", "info"]))
    query.delete()
    db.commit()
    ws_manager.broadcast_sync("NOTIFICATIONS_UPDATED", {"portal": "user", "user_id": user_id})

def mark_all_hospital_read(db: Session, hospital_id: str):
    db.query(Notification).filter(Notification.hospital_id == hospital_id).update({Notification.is_read: True})
    db.commit()
    ws_manager.broadcast_sync("NOTIFICATIONS_UPDATED", {"portal": "hospital", "hospital_id": hospital_id})

def clear_hospital_notifs(db: Session, hospital_id: str):
    db.query(Notification).filter(Notification.hospital_id == hospital_id).delete()
    db.commit()
    ws_manager.broadcast_sync("NOTIFICATIONS_UPDATED", {"portal": "hospital", "hospital_id": hospital_id})

