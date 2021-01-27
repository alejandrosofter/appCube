#!/usr/bin/python
# -*- coding: latin-1 -*-
import sys
import datetime
from wsfev1 import WSFEv1
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(dir_path+"/../")
from config import db
from config import WSAAURL
from config import WSDL
from config import getCuit

CUIT_EMPRESA=getCuit()
wsfev1 = WSFEv1()

ARGS= sys.argv

def init():
  wsfev1.LanzarExcepciones = True
  conectar()
  consultar("tipoComprobantes")
  consultar("tipoDocumentos")
  consultar("puntosVenta")
 
  
def ingresar(datos,tabla):
  tabla= db[tabla]
  res=tabla.insert(datos)
  return res

def conectar():
  print "CUIT",CUIT_EMPRESA
  wsfev1.Cuit = CUIT_EMPRESA
  cache = None
  proxy = ""
  wrapper = "" #"pycurl"
  from wsaa import WSAA
  cacert = WSAA.InstallDir + "conf/afip_ca_info.crt"
  
  ta = WSAA().Autenticar("wsfe", dir_path+"/certificado.crt", dir_path+"/privada.key", debug=True)
  wsfev1.SetTicketAcceso(ta)
  ok = wsfev1.Conectar(cache, WSDL, proxy, wrapper, cacert)
  #print wsfev1.ParamGetPtosVenta()
  print ok

def borrarTabla(tabla):
  tabla=db[tabla]
  tabla.drop()
def consultar(tipo):
  if(tipo=="tipoComprobantes"):
    tabla="tipoComprobantesElectronico"
    res= wsfev1.ParamGetTiposCbte()
    borrarTabla(tabla)
    for item in res:
      item= item.encode('utf-8').strip().split("|")
      dato={"_id":item[0],"label":item[1]}
      ingresar(dato,tabla)
  if(tipo=="tipoDocumentos"):
    tabla="tipoDocsElectronico"
    res= wsfev1.ParamGetTiposDoc()
    borrarTabla(tabla)
    for item in res:
      item= item.encode('utf-8').strip().split("|")
      dato={"_id":item[0],"label":item[1]}
      ingresar(dato,tabla)
  if(tipo=="puntosVenta"):
    tabla="puntosVentaElectronico"
    res= wsfev1.ParamGetPtosVenta()
    borrarTabla(tabla)
    for item in res:
      item= item.encode('utf-8').strip().split("|")
      dato={"_id":item[0],"label":item[1]}
      ingresar(dato,tabla)
  
  
init()