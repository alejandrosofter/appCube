#!/usr/bin/python
# -*- coding: latin-1 -*-
import sys
import datetime
from wsfev1 import WSFEv1
import os
import CONFIG
from CONFIG import db
from CONFIG import WSAAURL
from CONFIG import WSDL
wsfev1 = WSFEv1()
dir_path = os.path.dirname(os.path.realpath(__file__))
ARGS= sys.argv
CUIT_EMPRESA=20308585736

def init():
  wsfev1.LanzarExcepciones = True
  conectar()

def conectar():
  print "CUIT",CUIT_EMPRESA
  wsfev1.Cuit = CUIT_EMPRESA
  cache = None
  proxy = ""
  wrapper = "" #"pycurl"
  from wsaa import WSAA
  cacert = WSAA.InstallDir + "conf/afip_ca_info.crt" #True #geotrust.crt"
  ta = WSAA().Autenticar("wsfe", dir_path+"/certificado.crt", dir_path+"/privada.key", debug=True)
  wsfev1.SetTicketAcceso(ta)
  ok = wsfev1.Conectar(cache, WSDL, proxy, wrapper, cacert)
  print wsfev1.ParamGetTiposCbte()
  print ok
init()
