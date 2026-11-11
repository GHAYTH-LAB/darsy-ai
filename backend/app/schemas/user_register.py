from pydantic import BaseModel,Field,EmailStr
class User_register(BaseModel):
    name:str=Field(min_length=1,pattern=r"^[a-zA-Z0-9_]{3,20}$",description="The name of the User")
    surname:str=Field(min_length=1,pattern=r"^[a-zA-Z0-9_]{3,20}$",description="The Surname of the User")
    email:EmailStr=Field(min_length=1,description="The email of the user")
    password:str=Field(min_length=1,description="The password of User")