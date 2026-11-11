from pydantic import BaseModel,Field,EmailStr
from typing import Literal
class User_register(BaseModel):
    name:str=Field(min_length=1,pattern=r"^[a-zA-Z0-9_]{3,20}$",description="The name of the User")
    surname:str=Field(min_length=1,pattern=r"^[a-zA-Z0-9_]{3,20}$",description="The Surname of the User")
    email:EmailStr=Field(min_length=1,description="The email of the user")
    password:str=Field(min_length=8,description="The password of User")
class User_login(BaseModel):
    email:EmailStr=Field(min_length=1,description="The Email That The User registered with")
    password:str=Field(min_length=8,description="The password that the user registered with")
class TokenResponse(BaseModel):
    access_token:str=Field(min_length=1,description="The JWT access Token for the AUTH")
    token:Literal["bearer"]
