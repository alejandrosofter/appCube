from yowsup_gateway import YowsupGateway

gateway = YowsupGateway(credentials=("5492975365378", "DGuy+o/2dKRwNiS2FXoj3lkHNZc="))


# Receive messages
result = gateway.receive_messages()
if result.is_sucess:
   print (result.inbox)