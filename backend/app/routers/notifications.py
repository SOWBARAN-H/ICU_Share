from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    get_user_notifications,
    get_hospital_notifications,
    mark_all_user_read,
    clear_user_notifs,
    mark_all_hospital_read,
    clear_hospital_notifs,
    format_notification
)
from app.dependencies import get_current_actor

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    portal: Optional[str] = Query(None, description="user or hospital"),
    hospital_id: Optional[str] = Query(None, description="Hospital ID for hospital portal alerts"),
    actor: Optional[dict] = Depends(get_current_actor),
    db: Session = Depends(get_db)
):
    if portal == "hospital" or (actor and actor["type"] == "HOSPITAL"):
        hosp_id = actor["entity"].id if (actor and actor["type"] == "HOSPITAL") else (hospital_id or "hosp-3")
        return get_hospital_notifications(db, hosp_id)
    else:
        user_id = actor["entity"].id if (actor and actor["type"] == "USER") else None
        return get_user_notifications(db, user_id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return format_notification(notif)

@router.post("/mark-all-read")
def mark_all_read(
    portal: Optional[str] = Query("user"),
    hospital_id: Optional[str] = Query(None),
    actor: Optional[dict] = Depends(get_current_actor),
    db: Session = Depends(get_db)
):
    if portal == "hospital" or (actor and actor["type"] == "HOSPITAL"):
        hosp_id = actor["entity"].id if (actor and actor["type"] == "HOSPITAL") else (hospital_id or "hosp-3")
        mark_all_hospital_read(db, hosp_id)
    else:
        user_id = actor["entity"].id if (actor and actor["type"] == "USER") else None
        mark_all_user_read(db, user_id)
    return {"status": "success", "message": "All notifications marked as read"}

@router.delete("")
def clear_all(
    portal: Optional[str] = Query("user"),
    hospital_id: Optional[str] = Query(None),
    actor: Optional[dict] = Depends(get_current_actor),
    db: Session = Depends(get_db)
):
    if portal == "hospital" or (actor and actor["type"] == "HOSPITAL"):
        hosp_id = actor["entity"].id if (actor and actor["type"] == "HOSPITAL") else (hospital_id or "hosp-3")
        clear_hospital_notifs(db, hosp_id)
    else:
        user_id = actor["entity"].id if (actor and actor["type"] == "USER") else None
        clear_user_notifs(db, user_id)
    return {"status": "success", "message": "Notifications cleared"}
