from fastapi import FastAPI, HTTPException,File,UploadFile,Request,status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
import uvicorn
import json
import pymongo
from pydantic import BaseModel,Field
from typing import Optional,List
from datetime import datetime,timedelta,timezone
from bson import ObjectId
import random
import pytz

config = Config('.env')
app = FastAPI()


app.add_middleware(
    SessionMiddleware,
    secret_key=config("SECRET_KEY"), # Change this to a secure secret key
    max_age=3600,  # Set session expiration to 1 hour
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config("FRONTEND_URL"),config("BACKEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET')
FRONTEND_URL = config('FRONTEND_URL')
MONGODB_USERNAME = config('MONGODBUSERNAME')
MONGODB_PASSWORD = config('MONGODBPASSWORD')

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

class User(BaseModel):
    name:str
    email:str
    mobile_number:str
    credits:int
    points:int
    cms:int
    WMnumber:int
    VPnumber:int
    tags:List[str]
    picture:str
    
class VPSlot(BaseModel):
    owner:str
    departure_time:datetime
    from_location:str
    to_location:str
    members:List[str]
    id:str
    
class WMSlot(BaseModel):
    id:str
    start_time:datetime
    end_time:datetime
    otp:int
    user:str
    
class Requests(BaseModel):
    id:str
    request_from:str
    request_to:str
    type:str
    accepted:bool
    responded:bool
    slotid:str
    
def convert_mongo_document(document):
    if not document:
        return None
    document["_id"] = str(document["_id"])
    return document

def convert_mongo_documents(documents):
    if not documents:
        return None
    for document in documents:
        document["_id"] = str(document["_id"])
    
    return documents

def convert_to_local_iso(input_string):
    # Parse the input string (assuming GMT/UTC)
    dt = datetime.strptime(input_string, '%a, %d %b %Y %H:%M:%S %Z')
    
    # Set the timezone to UTC
    utc_dt = dt.replace(tzinfo=pytz.UTC)
    
    # Convert to local system timezone
    local_tz = pytz.timezone("Asia/Kolkata")  # Replace with your local timezone
    local_dt = utc_dt.astimezone(local_tz)
    

    iso_string = local_dt.isoformat()
    
    return iso_string

client = pymongo.MongoClient(f'mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@complan.7v6lx.mongodb.net/Complan_Database?retryWrites=true&w=majority&appName=Complan')
db = client["Complan_Database"]
userdb = db["users"]
wmdb = db["wmslots"]
vpdb = db["vpslots"]
rqdb = db["requests"]

@app.get('/api/auth/google')
async def google_login(request: Request):
    """Initiate Google OAuth login"""
    redirect_uri = request.url_for('auth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/api/auth/callback')
async def auth_callback(request: Request):
    """Handle the Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user = token.get('userinfo')
        if user:
            # Store user info in session
            user_data = {
                'id': user.get('sub'),
                'email': user.get('email'),
                'name': user.get('name'),
                'picture': user.get('picture'),
                'email_verified': user.get('email_verified')
            }
            request.session['user'] = user_data
            
            alreadythere = userdb.find({"email":user_data["email"]}).to_list()
            if(len(alreadythere)==0):
                userdb.insert_one({"name":user_data["name"],"email":user_data["email"],"picture":user_data["picture"],"mobile_number":123456789,"cms":0,"points":0,"credits":12,"rank":0,"tags":[],"WMnumber":0,"VPnumber":0})
            
            # Redirect to frontend with success
            return RedirectResponse(
                url=f"{FRONTEND_URL}?auth=success&user={json.dumps(user_data)}",
                status_code=status.HTTP_302_FOUND
            )
        
        return RedirectResponse(
            url=f"{FRONTEND_URL}?auth=error&message=Failed to get user info",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}?auth=error&message={str(e)}",
            status_code=status.HTTP_302_FOUND
        )

@app.get('/api/auth/user')
async def get_current_user(request: Request):
    """Get the current authenticated user"""
    user = request.session.get('user')
    if user:
        return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated"
    )

@app.post('/api/auth/logout')
async def logout(request: Request):
    """Logout the current user"""
    request.session.pop('user', None)
    return {"message": "Logged out successfully"}

@app.get('/api/auth/check')
async def check_auth(request: Request):
    """Check if user is authenticated"""
    user = request.session.get('user')
    return {
        "authenticated": user is not None,
        "user": user
    }
    
@app.get('/api/current_user')
async def get_current_user(request:Request):
    user = request.session.get('user')
    return convert_mongo_document(userdb.find_one({"email":user["email"]}))

class MobileNumberQuery(BaseModel):
    mobile_number:int

@app.post("/api/update-mobile-number")
async def update_mobile_number(request: Request, MNQ: MobileNumberQuery):
    user = request.session.get('user')
    if user:
        update_result = userdb.update_one(
            {"email": user["email"]},
            {"$set": {"mobile_number": MNQ.mobile_number}}
        )
        return {"modified_count": update_result.modified_count}
    else:
        return {"error": "User not found in session"}

@app.post("/api/avail-credits")
async def avail_credits(request:Request):   
    user = request.session.get('user')
    USER = convert_mongo_document(userdb.find_one({"email": user["email"]}))
    if user and USER["points"]>=50:
        update_result = userdb.update_one(
            {"email": user["email"]},
            {"$set": {"points":USER["points"]-50,"credits":USER["credits"]+1}}
        )
        return {"modified_count": update_result.modified_count}
    else:
        return {"error": "User not found in session"}
    

@app.get("/api/wmslots")
async def get_wmslots(request:Request):
    data =  convert_mongo_documents(wmdb.find().to_list())
    return {"wmslots":data,"user":request.session.get("user")}
    
@app.get("/api/wmslots/{id}")
async def get_wmslot_byid(request:Request,id:str):
    wmslot = convert_mongo_document(wmdb.find_one({"id":id}))
    user = request.session.get("user")
    return {"status":True,"wmslot":wmslot,"user":user}

class VerifyOTP(BaseModel):
    otp:int

@app.post("/api/wmslots/{id}/verify")
async def verfiy_otp(request:Request,post:VerifyOTP,id:str):
    wmslot = convert_mongo_document(wmdb.find_one({"id":id}))
    dbuser = convert_mongo_document(userdb.find_one({"email":request.session.get("user")["email"]}))
    
    if(wmslot["otp"]==post.otp):
        updatetime = wmdb.update_one({"id":id},{"$set":{"added_time":str(datetime.now().isoformat())}})
        updateuser = userdb.update_one({"email":request.session.get("user")["email"]},{"$set":{"points":dbuser["points"]+10,"cms":dbuser["cms"]+10,"WMnumber":dbuser["WMnumber"]+1}})
        return {"modified_wm_count": updatetime.modified_count,"modified_user_count":updateuser.modified_count,"success":True}
    else:
        return {"success":False}

@app.get("/api/wmslots/deduct-points/{id}")
async def deduct_points(request:Request,id:str):
    dbuser = convert_mongo_document(userdb.find_one({"email":request.session.get("user")["email"]}))
    updatewm = wmdb.update_one({"id":id},{"$set":{"deducted":True}})
    deletewm = wmdb.delete_one({"id":id})
    updateuser = userdb.update_one({"email":request.session.get("user")["email"]},{"$set":{"points":dbuser["points"]-10,"cms":dbuser["cms"]-10}})
    return {"modified_user_count":updateuser.modified_count,"modified_wm_count":deletewm.deleted_count}

@app.get("/api/wmslots/delete/{id}")
async def delete_wmslot(request:Request,id:str):
    getwm = wmdb.find_one({"id":id})
    if(getwm["user"]==request.session.get("user")["email"]):
        deletewm = wmdb.delete_one({"id":id})
        deleterq = rqdb.delete_many({"slotid":id})
        return {"status":True,"deleted_wm_count":deletewm.deleted_count,"deleted_requests":deleterq.deleted_count}
    else:
        return {"status":False}

class AddWMSlot(BaseModel):
    year:int
    month:int
    day:int
    hour:int
    minute:int

@app.post("/api/wmslots/add")
async def add_wmslot(request:Request,AWMS:AddWMSlot):
    u = userdb.find_one({"email":request.session.get("user")["email"]})
    if(u["credits"]<=0):
        return {"status":False,"meesage":"Insufficient credits"}
    
    
    start_time = datetime(year=AWMS.year,month=AWMS.month,day=AWMS.day,hour=AWMS.hour,minute=AWMS.minute)
    end_time = start_time + timedelta(hours=1)
    allwmdocs = wmdb.find().to_list()
    
    ID = 0
    for docs in allwmdocs:
        wmid = int(docs["id"][2])
        ID = max(ID,wmid)
        
    newid = "WM"+str(ID+1)
        
    for docs in allwmdocs:
        dstart_time = datetime.fromisoformat(docs["start_time"])
        dend_time = datetime.fromisoformat(docs["end_time"])
        if((dstart_time<end_time and start_time<dend_time)):
            return {"status":False,"message":"Slot clashing with other slots.."}
        elif((abs((start_time-dend_time).total_seconds()) < 15*60) or (abs((dstart_time-end_time).total_seconds()) < 15*60)):
            return {"status":False,"message":"Slot clashing with other slots.."}
            
    
    insertwm = wmdb.insert_one({"start_time":start_time.isoformat(),"end_time":end_time.isoformat(),"otp":random.randint(1000,9999),"user":request.session.get("user")["email"],"id":newid,"added_time":"","deducted":False})
    updateuser = userdb.update_one({"email":request.session.get("user")["email"]},{"$set":{"credits":u["credits"]-1}})
    return {"status":True,"inserted_wmslot":str(insertwm.inserted_id),"updated_user":updateuser.modified_count}

class AskWMSlot(BaseModel):
    year:int
    month:int
    day:int
    hour:int
    minute:int
    id:str
    email:str

@app.post("/api/wmslots/ask")
async def ask_wmslot(request:Request,AWMS:AskWMSlot):
    allrqdocs = convert_mongo_documents(rqdb.find({}).to_list())
    alreadysent = rqdb.find_one({"slotid":AWMS.id,"request_from":request.session.get("user")["email"]})
    if(alreadysent!=None):
        return {"status":False,"message":"Request already sent"}
    ID = 0
    if(allrqdocs!=None):
        ID = max((int(doc["id"][2:]) for doc in allrqdocs), default=0) + 1
    rqid = f"RQ{ID}"
    
    now = datetime(year=AWMS.year,month=AWMS.month,day=AWMS.day,hour=AWMS.hour,minute=AWMS.minute)
    
    addedrq = rqdb.insert_one({"id":rqid,"request_from":request.session.get("user")["email"],"request_to":AWMS.email,"slotid":AWMS.id,"type":"WMSlot Ask Request","accepted":False,"responded":False,"time_of_request":now.isoformat()})
    return {"status":True,"added_request":str(addedrq.inserted_id)}

@app.get("/api/currentuser/requests/")
async def ask_wmslot(request:Request):
    receivedrq = convert_mongo_documents(rqdb.find({"request_to":request.session.get("user")["email"]}).to_list())
    sentrq = convert_mongo_documents(rqdb.find({"request_from":request.session.get("user")["email"]}).to_list())
    
    return {"sent":sentrq,"received":receivedrq}

class RespondRequest(BaseModel):
    id:str
    accepted:bool

@app.post("/api/requests/respond")
async def respond_request(request:Request,RR:RespondRequest):
    rq = rqdb.find_one({"id":RR.id})
    if(rq["request_to"]==request.session.get("user")["email"]):
        respondupdate = rqdb.update_one({"id":RR.id},{"$set":{"accepted":RR.accepted,"responded":True}})
        if(RR.accepted==False):
            return {"status":True,"changed_request":respondupdate.modified_count}
        ufrom = userdb.find_one({"email":rq["request_from"]})
        uto = userdb.find_one({"email":rq["request_to"]})
        if(rq["slotid"][0]=="W"):
            wm = wmdb.find_one({"id":rq["slotid"]})
            ufromupdate = userdb.update_one({"email":ufrom["email"]},{"$set":{"credits":ufrom["credits"]-1}})
            utoupdate = userdb.update_one({"email":uto["email"]},{"$set":{"credits":uto["credits"]+1}})
            wmupdate = wmdb.update_one({"id":rq["slotid"]},{"$set":{"user":ufrom["email"],"otp":random.randint(1000,9999)}})
            return {"status":True,"wmmodified":wmupdate.modified_count,"usermodified":utoupdate.modified_count+ufromupdate.modified_count}
        else:
            vp = vpdb.find_one({"id":rq["slotid"]})
            vpupdate = vpdb.update_one({"id":rq["slotid"]},{"$set":{"members":vp["members"]+[{"name":ufrom["name"],"contact":ufrom["mobile_number"]}]}})
            return {"status":True,"updated_vpslot":vpupdate.modified_count}
            
            
    return {"status":False}

@app.get("/api/vpslots")
async def get_vpslots(request:Request):
    data =  convert_mongo_documents(vpdb.find().to_list())
    return {"vpslots":data,"user":request.session.get("user")}


class AddVPSlot(BaseModel):
    from_location:str
    to_location:str
    year:int
    month:int
    day:int
    hour:int
    minute:int

@app.post("/api/vpslots/add")
async def add_vpslot(request:Request,AVPS:AddVPSlot):
    allvpdocs = vpdb.find().to_list()
    u = userdb.find_one({"email":request.session.get("user")["email"]});
    
    ID = 0
    for docs in allvpdocs:
        vpid = int(docs["id"][2])
        ID = max(ID,vpid)
        
    id = "VP"+str(ID+1)
    time = datetime(year=AVPS.year,month=AVPS.month,day=AVPS.day,hour=AVPS.hour,minute=AVPS.minute)
    
    addedvp = vpdb.insert_one({"id":id,"time":time.isoformat(),"from_location":AVPS.from_location,"to_location":AVPS.to_location,"owner":{"name":u["name"],"contact":u["mobile_number"]},"members":[]})
    return {"status":True,"added_vpslot":str(addedvp.inserted_id)}

@app.get("/api/vpslots/{id}")
async def get_vpslot(request:Request,id:str):
    vpslot = convert_mongo_document(vpdb.find_one({"id":id}))
    user = request.session.get("user")
    return {"status":True,"vpslot":vpslot,"user":user}
    
@app.get("/api/vpslots/leave/{id}")
async def leave_vpslot(request:Request,id:str):
    u = userdb.find_one({"email":request.session.get("user")["email"]})
    vpslot = vpdb.find_one({"id":id})
    
    if(vpslot["owner"]["name"]==u["name"]):
        if(len(vpslot["members"])==0):
            delvp = vpdb.delete_one({"id":id})
            delrq = rqdb.delete_many({"slotid":id})
            return {"status":True,"deleted_vpslot":delvp.deleted_count,"deleted_requests":delrq.deleted_count}
        
        updatevp = vpdb.update_one({"id":id},{"$set":{"owner":vpslot["members"][0],"members":vpslot["members"][1:]}})
        return {"status":True,"updated_vpslot":updatevp.modified_count}
    
    delindex = 0
    for index,i in enumerate(vpslot["members"]):
        if(i["name"]==u["name"] and i["contact"]==u["mobile_number"]):
            delindex = index
    
    updatevp = vpdb.update_one({"id":id},{"$set":{"members":vpslot["members"][:delindex]+vpslot["members"][delindex+1:]}})
    return {"status":True,"updated_vpslot":updatevp.modified_count}

class AskVPSlot(BaseModel):
    year:int
    month:int
    day:int
    hour:int
    minute:int
    id:str
    contact:int

@app.post("/api/vpslots/join")
async def join_vpslot(request:Request,AVPS:AskVPSlot):
    allrqdocs = convert_mongo_documents(rqdb.find({}).to_list())
    alreadysent = rqdb.find_one({"slotid":AVPS.id,"request_from":request.session.get("user")["email"]})
    if(alreadysent!=None):
        return {"status":False,"message":"Request already sent"}
    u = userdb.find_one({"mobile_number":AVPS.contact})
    ID = 0
    if(allrqdocs!=None):
        ID = max((int(doc["id"][2:]) for doc in allrqdocs), default=0) + 1
    rqid = f"RQ{ID}"
    
    now = datetime(year=AVPS.year,month=AVPS.month,day=AVPS.day,hour=AVPS.hour,minute=AVPS.minute)
    
    addedrq = rqdb.insert_one({"id":rqid,"request_from":request.session.get("user")["email"],"request_to":u["email"],"slotid":AVPS.id,"type":"VPSlot Join Request","accepted":False,"responded":False,"time_of_request":now.isoformat()})
    return {"status":True,"added_request":str(addedrq.inserted_id)}

@app.get("/api/users")
async def get_all_users(request:Request):
    data =  convert_mongo_documents(userdb.find().to_list())
    return {"users":data,"user":request.session.get("user")}
    