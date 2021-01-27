#!/usr/bin/python
# -*- coding: latin-1 -*-
import sys
import datetime
import os
dir_path = os.path.dirname(os.path.realpath(__file__))
from bson.objectid import ObjectId 
from wsaa import WSAA
#sys.path.insert(0, '../config')
sys.path.append(dir_path+"/../")
from config import db
#pagina de complementos 
#https://github.com/reingart/pyafipws/wiki/InstalacionCodigoFuente
ARGS= sys.argv
COMPS_NO_IVA=["11","12","13","15"]
NROCOMP=0

def init():
  cuit=consultarCuit()
  empresa=consultarEmpresa()
  wsa= WSAA()
  if "--nuevoPedido" in sys.argv:
    crearPedido(empresa,cuit)
  if "--check" in sys.argv: 
    cert=dir_path+"/certificado.crt"
    key=dir_path+"/privada.key"
    print key
    res=""
    try:
      res= wsa.Autenticar("wsfe", cert, key, debug=True)
    except:
      res= "Unexpected error:", sys.exc_info()[0]
    print res
#     print wsa.Identidad
#     print wsa.Caducidad
#     print wsa.Emisor
#     print wsa.CertX509

def consultarCuit():
  tabla= db.settings
  res=tabla.find_one({"clave":"cuitEmpresa"})
  return res['valor']

def consultarEmpresa():
  tabla= db.settings
  res=tabla.find_one({"clave":"nombreEmpresa"})
  return res['valor']

def buscaFactura(idFactura):
  tabla= db.ventas
  res=tabla.find_one({"_id":idFactura})
  return res

def crearPedido(empresa,cuit):
  wsa= WSAA()
  archivo=dir_path+"/privada.key"
  archivo2=dir_path+"/empresa.csr"
  print archivo2
  dataPedido=wsa.CrearClavePrivada(archivo)
  dataCert=wsa.CrearPedidoCertificado(cuit,empresa,"yavu",archivo2)
  db.settings.update_one( {"clave":"pedido_fe"},{"$set":{"valor":dataCert}} )
  db.settings.update_one( {"clave":"privada_fe"},{"$set":{"valor":dataPedido}} )
  
def ingresar(nroFac):
  #ARGS : puntoVenta,tipoComprobante,concepto,tipoDoc,nroDoc
  import time
  t0 = time.time()
  wsfev1.CAESolicitar()
  t1 = time.time()
  print  "R%",wsfev1.Resultado, "|CAE%", wsfev1.CAE ,"|VENC%",wsfev1.Vencimiento,"|OBS%",wsfev1.Obs,"|NRO%",nroFac
  
init()
