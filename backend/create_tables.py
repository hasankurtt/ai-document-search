from app.database import Base, engine
from app.models import User, Room, Document, Message

# Tablolar oluştur
Base.metadata.create_all(bind=engine)
print("✅ Tablolar oluşturuldu!")
