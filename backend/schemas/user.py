from pydantic import BaseModel,Field,ConfigDict,EmailStr

class UserBase(BaseModel):
    name:str=Field(min_length=2)
    prename:str=Field(min_length=2)
    email:EmailStr

class Usercreate(UserBase):
    password:str=Field(pattern=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
class UserResponse(UserBase):
    model_config=ConfigDict(from_attributes=True)
