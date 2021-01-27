#!/usr/bin/python
# -*- coding: latin-1 -*-
import sys
import datetime
from wsfev1 import WSFEv1
import os
import pymongo
from bson.objectid import ObjectId 

#sys.path.insert(0, '../CONFIG')
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(dir_path+"/../")
from config import db
from config import db
from config import WSAAURL
from config import WSDL
from config import getCuit

wsfev1 = WSFEv1()

CUIT=getCuit()
print CUIT
ARGS= sys.argv
COMPS_NO_IVA=["11","12","13","15"]

def init():
  wsfev1.LanzarExcepciones = True
  conectar()
  nroFac=generarFactura()
  ingresar(nroFac)
  
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

def conectar():
  cache = None
  proxy = ""
  wrapper = "" #"pycurl"
  from wsaa import WSAA
  cacert = WSAA.InstallDir + "conf/afip_ca_info.crt"
  ta = WSAA().Autenticar("wsfe", dir_path+"/certificado.crt", dir_path+"/privada.key", debug=True)
  wsfev1.SetTicketAcceso(ta)
  ok = wsfev1.Conectar(cache, WSDL, proxy, wrapper, cacert)
  wsfev1.Cuit = CUIT
  return ok

def generarFactura():
   #puntoVenta,tipoComprobante,concepto,tipoDoc,nroDoc,importe ARGS
  importeTotal=float(ARGS[6])
  importeNeto=round(importeTotal/1.21,2)
  importeIva=importeTotal-importeNeto
  tipo_cbte = ARGS[2]
  punto_vta = ARGS[1]
  cbte_nro = long(wsfev1.CompUltimoAutorizado(tipo_cbte, punto_vta) or 0)
  
  fecha = datetime.datetime.now().strftime("%Y%m%d")
  concepto = ARGS[3]
  tipo_doc = ARGS[4]
  nro_doc = ARGS[5]
  cbt_desde = cbte_nro + 1; cbt_hasta = cbte_nro + 1
  imp_total = importeTotal; imp_tot_conc = "0.00"; imp_neto = importeNeto
  imp_iva = importeIva; imp_trib = "0.00"; imp_op_ex = "0.00"
  fecha_cbte = fecha
          # Fechas del per�odo del servicio facturado y vencimiento de pago:

  fecha_venc_pago = fecha_serv_desde = fecha_serv_hasta = fecha
  moneda_id = 'PES'; moneda_ctz = '1.000'
  if(tipo_cbte in COMPS_NO_IVA):
    imp_iva=0
    imp_neto=importeTotal
  
  wsfev1.CrearFactura(concepto, tipo_doc, nro_doc, 
                  tipo_cbte, punto_vta, cbt_desde , cbt_hasta , 
                  imp_total, imp_tot_conc, imp_neto,
                  imp_iva, imp_trib, imp_op_ex, fecha_cbte, fecha_venc_pago, 
                  fecha_serv_desde, fecha_serv_hasta, #--
                  moneda_id, moneda_ctz)
  

  #             # subtotales por alicuota de IVA:
  if(not tipo_cbte in COMPS_NO_IVA):
    iva_id = 5 # 21%
    base_imp = importeNeto
    importe = importeIva
    wsfev1.AgregarIva(iva_id, base_imp, importe)
  return cbt_desde

def ingresar(nroFac):
  #ARGS : puntoVenta,tipoComprobante,concepto,tipoDoc,nroDoc
  import time
  t0 = time.time()
  wsfev1.CAESolicitar()
  t1 = time.time()
  print  "R%",wsfev1.Resultado, "|CAE%", wsfev1.CAE ,"|VENC%",wsfev1.Vencimiento,"|OBS%",wsfev1.Obs,"|NRO%",nroFac
  
init()