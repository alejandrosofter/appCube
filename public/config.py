#!/usr/bin/python
# -*- coding: latin-1 -*-
import pymongo
import os
from pymongo import MongoClient
##----------- DB SETTINGS -------------------||
HOST="localhost"
db=None
CUIT_EMPRESA=""

##----------- DB SETTINGS -------------------||
def getCarpetaPrograma():
    path=os.path.dirname(os.path.abspath(__file__+"/../../../../"))
    arr=path.split("/")
    tam=len(arr)
    return arr[tam-1].strip().replace(".","")
def setBase():
    nombreBase=getCarpetaPrograma()
    global db
    global HOST
    
    if(nombreBase=="www" or nombreBase=="" or nombreBase=="meteor" or nombreBase=="local"):
      PORT=3001
      client = MongoClient(HOST, PORT)
      db = client.meteor
    else:
      PORT= 27017
      client = MongoClient(HOST, PORT)
      db=client[nombreBase]
##----------- FACTURACION ELECTRONICA -------------------||
#WSAAURL = "https://wsaa.afip.gov.ar/ws/services/LoginCms" # PRODUCCION!!!
WSAAURL = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms" # homologacion (pruebas)

WSDL = "https://servicios1.afip.gov.ar/wsfev1/service.asmx?WSDL"  # El WSDL correspondiente al WSAA 
WSDL_WSAA = "https://wsaa.afip.gov.ar/ws/services/LoginCms?wsdl"  
##----------- FACTURACION ELECTRONICA -------------------||
def getCuit():
  tabla= db.settings
  res=tabla.find_one({"clave":"cuitEmpresa"})
  return res['valor']
def getEmpresa():
  tabla= db.settings
  res=tabla.find_one({"clave":"nombreEmpresa"})
  return res['valor']

setBase()