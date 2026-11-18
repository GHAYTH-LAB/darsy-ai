from pydantic import BaseModel,Field,ConfigDict

class ConversationBase(BaseModel):
    message:str=Field(min_length=1)

class ConversationInput(ConversationBase):
    role:str="User"

class ConversationOutput(ConversationBase):
    role:str="Assistant"
    model_config=ConfigDict(from_attributes=True)
    
