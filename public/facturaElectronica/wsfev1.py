#!/usr/bin/python
# -*- coding: latin-1 -*-
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by the
# Free Software Foundation; either version 3, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTIBILITY
# or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
# for more details.

"""M�dulo para obtener CAE/CAEA, c�digo de autorizaci�n electr�nico webservice 
WSFEv1 de AFIP (Factura Electr�nica Nacional - Proyecto Version 1 - 2.10)
Seg�n RG 2485/08, RG 2757/2010, RG 2904/2010 y RG2926/10 (CAE anticipado), 
RG 3067/2011 (RS - Monotributo), RG 3571/2013 (Responsables inscriptos IVA), 
RG 3668/2014 (Factura A IVA F.8001), RG 3749/2015 (R.I. y exentos)
RG 4004-E Alquiler de inmuebles con destino casa habitaci�n).  
RG 4109-E Venta de bienes muebles registrables.
M�s info: http://www.sistemasagiles.com.ar/trac/wiki/ProyectoWSFEv1
"""

__author__ = "Mariano Reingart <reingart@gmail.com>"
__copyright__ = "Copyright (C) 2010-2017 Mariano Reingart"
__license__ = "GPL 3.0"
__version__ = "1.20a"

import datetime
import decimal
import os
import sys
from utils import verifica, inicializar_y_capturar_excepciones, BaseWS, get_install_dir

from CONFIG import WSDL
HOMO = False                    # solo homologaci�n
TYPELIB = False                 # usar librer�a de tipos (TLB)
LANZAR_EXCEPCIONES = False      # valor por defecto: True

#WSDL = "https://www.sistemasagiles.com.ar/simulador/wsfev1/call/soap?WSDL=None"
#WSDL = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL"
#WSDL = "file:///home/reingart/tmp/service.asmx.xml"


class WSFEv1(BaseWS):
    "Interfaz para el WebService de Factura Electr�nica Version 1 - 2.10"
    _public_methods_ = ['CrearFactura', 'AgregarIva', 'CAESolicitar', 
                        'AgregarTributo', 'AgregarCmpAsoc', 'AgregarOpcional',
                        'AgregarComprador',
                        'CompUltimoAutorizado', 'CompConsultar',
                        'CAEASolicitar', 'CAEAConsultar', 'CAEARegInformativo',
                        'CAEASinMovimientoInformar',
                        'CAESolicitarX', 
                        'IniciarFacturasX', 'AgregarFacturaX', 'LeerFacturaX',
                        'ParamGetTiposCbte',
                        'ParamGetTiposConcepto',
                        'ParamGetTiposDoc',
                        'ParamGetTiposIva',
                        'ParamGetTiposMonedas',
                        'ParamGetTiposOpcional',
                        'ParamGetTiposTributos',
                        'ParamGetTiposPaises',
                        'ParamGetCotizacion', 
                        'ParamGetPtosVenta',
                        'AnalizarXml', 'ObtenerTagXml', 'LoadTestXML',
                        'SetParametros', 'SetTicketAcceso', 'GetParametro', 
                        'EstablecerCampoFactura', 'ObtenerCampoFactura',
                        'Dummy', 'Conectar', 'DebugLog', 'SetTicketAcceso']
    _public_attrs_ = ['Token', 'Sign', 'Cuit', 
        'AppServerStatus', 'DbServerStatus', 'AuthServerStatus', 
        'XmlRequest', 'XmlResponse', 'Version', 'Excepcion', 'LanzarExcepciones',
        'Resultado', 'Obs', 'Observaciones', 'Traceback', 'InstallDir',
        'CAE','Vencimiento', 'Eventos', 'Errores', 'ErrCode', 'ErrMsg',
        'Reprocesar', 'Reproceso', 'EmisionTipo', 'CAEA',
        'CbteNro', 'CbtDesde', 'CbtHasta', 'FechaCbte', 
        'ImpTotal', 'ImpNeto', 'ImptoLiq',
        'ImpIVA', 'ImpOpEx', 'ImpTrib',]
        
    _reg_progid_ = "WSFEv1"
    _reg_clsid_ = "{CA0E604D-E3D7-493A-8880-F6CDD604185E}"

    if TYPELIB:
        _typelib_guid_ = '{B1D7283C-3EC2-463E-89B4-11F5228E2A15}'
        _typelib_version_ = 1, 18
        _com_interfaces_ = ['IWSFEv1']
        ##_reg_class_spec_ = "wsfev1.WSFEv1"
        
    # Variables globales para BaseWS:
    HOMO = HOMO
    WSDL = WSDL
    Version = "%s %s" % (__version__, HOMO and 'Homologaci�n' or '')
    Reprocesar = True   # recuperar automaticamente CAE emitidos
    LanzarExcepciones = LANZAR_EXCEPCIONES
    factura = None
    facturas = None
    
    def inicializar(self):
        BaseWS.inicializar(self)
        self.AppServerStatus = self.DbServerStatus = self.AuthServerStatus = None
        self.Resultado = self.Motivo = self.Reproceso = ''
        self.LastID = self.LastCMP = self.CAE = self.CAEA = self.Vencimiento = ''
        self.CbteNro = self.CbtDesde = self.CbtHasta = self.PuntoVenta = None
        self.ImpTotal = self.ImpIVA = self.ImpOpEx = self.ImpNeto = self.ImptoLiq = self.ImpTrib = None
        self.EmisionTipo = self.Periodo = self.Orden = ""
        self.FechaCbte = self.FchVigDesde = self.FchVigHasta = self.FchTopeInf = self.FchProceso = ""
        
    def __analizar_errores(self, ret):
        "Comprueba y extrae errores si existen en la respuesta XML"
       
        if 'Errors' in ret:
            errores = ret['Errors']
            for error in errores:
                self.Errores.append("%s: %s" % (
                    error['Err']['Code'],
                    error['Err']['Msg'],
                    ))
            self.ErrCode = ' '.join([str(error['Err']['Code']) for error in errores])
            self.ErrMsg = '\n'.join(self.Errores)
        if 'Events' in ret:
            events = ret['Events']
            self.Eventos = ['%s: %s' % (evt['Evt']['Code'], evt['Evt']['Msg']) for evt in events]
        print self.Eventos

    @inicializar_y_capturar_excepciones
    def Dummy(self):
        "Obtener el estado de los servidores de la AFIP"
        result = self.client.FEDummy()['FEDummyResult']
        self.AppServerStatus = result.get('AppServer')
        self.DbServerStatus = result.get('DbServer')
        self.AuthServerStatus = result.get('AuthServer')
        return True
    def Dummy2(self):
      "Obtener el estado de los servidores de la AFIP"
      result = self.client.FEDummy()['FEDummyResult']
      self.AppServerStatus = result.get('AppServer')
      self.DbServerStatus = result.get('DbServer')
      self.AuthServerStatus = result.get('AuthServer')
      return True

    # los siguientes m�todos no est�n decorados para no limpiar propiedades

    def CrearFactura(self, concepto=1, tipo_doc=80, nro_doc="", tipo_cbte=1, punto_vta=0,
            cbt_desde=0, cbt_hasta=0, imp_total=0.00, imp_tot_conc=0.00, imp_neto=0.00,
            imp_iva=0.00, imp_trib=0.00, imp_op_ex=0.00, fecha_cbte="", fecha_venc_pago=None, 
            fecha_serv_desde=None, fecha_serv_hasta=None, #--
            moneda_id="PES", moneda_ctz="1.0000", caea=None, **kwargs
            ):
        "Creo un objeto factura (interna)"
        # Creo una factura electronica de exportaci�n 
        fact = {'tipo_doc': tipo_doc, 'nro_doc':  nro_doc,
                'tipo_cbte': tipo_cbte, 'punto_vta': punto_vta,
                'cbt_desde': cbt_desde, 'cbt_hasta': cbt_hasta,
                'imp_total': imp_total, 'imp_tot_conc': imp_tot_conc,
                'imp_neto': imp_neto, 'imp_iva': imp_iva,
                'imp_trib': imp_trib, 'imp_op_ex': imp_op_ex,
                'fecha_cbte': fecha_cbte,
                'fecha_venc_pago': fecha_venc_pago,
                'moneda_id': moneda_id, 'moneda_ctz': moneda_ctz,
                'concepto': concepto,
                'cbtes_asoc': [],
                'tributos': [],
                'iva': [],
                'opcionales': [],
                'compradores': [],
            }
        if fecha_serv_desde: fact['fecha_serv_desde'] = fecha_serv_desde
        if fecha_serv_hasta: fact['fecha_serv_hasta'] = fecha_serv_hasta
        if caea: fact['caea'] = caea

        self.factura = fact
        return True

    def EstablecerCampoFactura(self, campo, valor):
        if campo in self.factura or campo in ('fecha_serv_desde', 'fecha_serv_hasta', 'caea', 'fch_venc_cae'):
            self.factura[campo] = valor
            return True
        else:
            return False

    def AgregarCmpAsoc(self, tipo=1, pto_vta=0, nro=0, cuit=None, **kwarg):
        "Agrego un comprobante asociado a una factura (interna)"
        cmp_asoc = {'tipo': tipo, 'pto_vta': pto_vta, 'nro': nro}
        if cuit is not None:
            cmp_asoc['cuit'] = cuit
        self.factura['cbtes_asoc'].append(cmp_asoc)
        return True

    def AgregarTributo(self, tributo_id=0, desc="", base_imp=0.00, alic=0, importe=0.00, **kwarg):
        "Agrego un tributo a una factura (interna)"
        tributo = { 'tributo_id': tributo_id, 'desc': desc, 'base_imp': base_imp, 
                    'alic': alic, 'importe': importe}
        self.factura['tributos'].append(tributo)
        return True

    def AgregarIva(self, iva_id=0, base_imp=0.0, importe=0.0, **kwarg):
        "Agrego un tributo a una factura (interna)"
        iva = { 'iva_id': iva_id, 'base_imp': base_imp, 'importe': importe }
        self.factura['iva'].append(iva)
        return True

    def AgregarOpcional(self, opcional_id=0, valor="", **kwarg):
        "Agrego un dato opcional a una factura (interna)"
        op = { 'opcional_id': opcional_id, 'valor': valor }
        self.factura['opcionales'].append(op)
        return True

    def AgregarComprador(self, doc_tipo=80, doc_nro=0, porcentaje=100.00, **kwarg):
        "Agrego un comprador a una factura (interna) RG 4109-E bienes muebles"
        comp = { 'doc_tipo': doc_tipo, 'doc_nro': doc_nro,
                 'porcentaje': porcentaje }
        self.factura['compradores'].append(comp)
        return True

    def ObtenerCampoFactura(self, *campos):
        "Obtener el valor devuelto de AFIP para un campo de factura"
        # cada campo puede ser una clave string (dict) o una posici�n (list)
        ret = self.factura
        for campo in campos:
            if isinstance(ret, dict) and isinstance(campo, basestring):
                ret = ret.get(campo)
            elif isinstance(ret, list) and len(ret) > campo:
                ret = ret[campo]
            else:
                self.Excepcion = u"El campo %s solicitado no existe" % campo
                ret = None
            if ret is None:
                break
        return str(ret)

    # metodos principales para llamar remotamente a AFIP:

    @inicializar_y_capturar_excepciones
    def CAESolicitar(self):
        f = self.factura
        ret = self.client.FECAESolicitar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            FeCAEReq={
                'FeCabReq': {'CantReg': 1, 
                    'PtoVta': f['punto_vta'], 
                    'CbteTipo': f['tipo_cbte']},
                'FeDetReq': [{'FECAEDetRequest': {
                    'Concepto': f['concepto'],
                    'DocTipo': f['tipo_doc'],
                    'DocNro': f['nro_doc'],
                    'CbteDesde': f['cbt_desde'],
                    'CbteHasta': f['cbt_hasta'],
                    'CbteFch': f['fecha_cbte'],
                    'ImpTotal': f['imp_total'],
                    'ImpTotConc': f['imp_tot_conc'],
                    'ImpNeto': f['imp_neto'],
                    'ImpOpEx': f['imp_op_ex'],
                    'ImpTrib': f['imp_trib'],
                    'ImpIVA': f['imp_iva'],
                    # Fechas solo se informan si Concepto in (2,3)
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f.get('fecha_venc_pago'),
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f['fecha_venc_pago'],
                    'MonId': f['moneda_id'],
                    'MonCotiz': f['moneda_ctz'],                
                    'CbtesAsoc': f['cbtes_asoc'] and [
                        {'CbteAsoc': {
                            'Tipo': cbte_asoc['tipo'],
                            'PtoVta': cbte_asoc['pto_vta'], 
                            'Nro': cbte_asoc['nro'],
                            'Cuit': cbte_asoc.get('cuit'),
                        }}
                        for cbte_asoc in f['cbtes_asoc']] or None,
                    'Tributos': f['tributos'] and [
                        {'Tributo': {
                            'Id': tributo['tributo_id'], 
                            'Desc': tributo['desc'],
                            'BaseImp': tributo['base_imp'],
                            'Alic': tributo['alic'],
                            'Importe': tributo['importe'],
                            }}
                        for tributo in f['tributos']] or None,
                    'Iva': f['iva'] and [ 
                        {'AlicIva': {
                            'Id': iva['iva_id'],
                            'BaseImp': iva['base_imp'],
                            'Importe': iva['importe'],
                            }}
                        for iva in f['iva']] or None,
                    'Opcionales': [ 
                        {'Opcional': {
                            'Id': opcional['opcional_id'],
                            'Valor': opcional['valor'],
                            }} for opcional in f['opcionales']] or None,
                    'Compradores': [ 
                        {'Comprador': {
                            'DocTipo': comprador['doc_tipo'],
                            'DocNro': comprador['doc_nro'],
                            'Porcentaje': comprador['porcentaje'],
                            }} for comprador in f['compradores']] or None,
                    }
                }]
            })
        
        result = ret['FECAESolicitarResult']
        if 'FeCabResp' in result:
            fecabresp = result['FeCabResp']
            fedetresp = result['FeDetResp'][0]['FECAEDetResponse']
            
            # Reprocesar en caso de error (recuperar CAE emitido anteriormente)
            if self.Reprocesar and ('Errors' in result or 'Observaciones' in fedetresp):
                for error in result.get('Errors',[])+fedetresp.get('Observaciones',[]):
                    err_code = str(error.get('Err', error.get('Obs'))['Code'])
                    if fedetresp['Resultado']=='R' and err_code=='10016':
                        # guardo los mensajes xml originales
                        xml_request = self.client.xml_request
                        xml_response = self.client.xml_response
                        cae = self.CompConsultar(f['tipo_cbte'], f['punto_vta'], f['cbt_desde'], reproceso=True)
                        if cae and self.EmisionTipo=='CAE':
                            self.Reproceso = 'S'
                            return cae
                        self.Reproceso = 'N'
                        # reestablesco los mensajes xml originales
                        self.client.xml_request = xml_request
                        self.client.xml_response = xml_response
                        
            self.Resultado = fecabresp['Resultado']
            # Obs:
            for obs in fedetresp.get('Observaciones', []):
                self.Observaciones.append("%(Code)s: %(Msg)s" % (obs['Obs']))
            self.Obs = '\n'.join(self.Observaciones)
            self.CAE = fedetresp['CAE'] and str(fedetresp['CAE']) or ""
            self.EmisionTipo = 'CAE'
            self.Vencimiento = fedetresp['CAEFchVto']
            self.FechaCbte = fedetresp.get('CbteFch', "") #.strftime("%Y/%m/%d")
            self.CbteNro = fedetresp.get('CbteHasta', 0) # 1L
            self.PuntoVenta = fecabresp.get('PtoVta', 0) # 4000
            self.CbtDesde =fedetresp.get('CbteDesde', 0)
            self.CbtHasta = fedetresp.get('CbteHasta', 0)
        self.__analizar_errores(result)
        return self.CAE

    @inicializar_y_capturar_excepciones
    def CompTotXRequest(self):
        ret = self.client.FECompTotXRequest (
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        
        result = ret['FECompTotXRequestResult']
        return result['RegXReq']

    @inicializar_y_capturar_excepciones
    def CompUltimoAutorizado(self, tipo_cbte, punto_vta):
        ret = self.client.FECompUltimoAutorizado(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            PtoVta=punto_vta,
            CbteTipo=tipo_cbte,
            )
        
        result = ret['FECompUltimoAutorizadoResult']
        self.CbteNro = result['CbteNro']        
        self.__analizar_errores(result)
        return self.CbteNro is not None and str(self.CbteNro) or ''

    @inicializar_y_capturar_excepciones
    def CompConsultar(self, tipo_cbte, punto_vta, cbte_nro, reproceso=False):
        difs = [] # si hay reproceso, verifico las diferencias con AFIP

        ret = self.client.FECompConsultar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            FeCompConsReq={
                'CbteTipo': tipo_cbte,
                'CbteNro': cbte_nro,
                'PtoVta': punto_vta,
            })
        
        result = ret['FECompConsultarResult']
        if 'ResultGet' in result:
            resultget = result['ResultGet']
            
            if reproceso:
                # verifico los campos registrados coincidan con los enviados:
                f = self.factura
                verificaciones = {
                    'Concepto': f['concepto'],
                    'DocTipo': f['tipo_doc'],
                    'DocNro': f['nro_doc'],
                    'CbteTipo': f['tipo_cbte'],
                    'CbteDesde': f['cbt_desde'],
                    'CbteHasta': f['cbt_hasta'],
                    'CbteFch': f['fecha_cbte'],
                    'ImpTotal': f['imp_total'] and float(f['imp_total']) or 0.0,
                    'ImpTotConc': f['imp_tot_conc'] and float(f['imp_tot_conc']) or 0.0,
                    'ImpNeto': f['imp_neto'] and float(f['imp_neto']) or 0.0,
                    'ImpOpEx': f['imp_op_ex'] and float(f['imp_op_ex']) or 0.0,
                    'ImpTrib': f['imp_trib'] and float(f['imp_trib']) or 0.0,
                    'ImpIVA': f['imp_iva'] and float(f['imp_iva']) or 0.0,
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f.get('fecha_venc_pago'),
                    'MonId': f['moneda_id'],
                    'MonCotiz': float(f['moneda_ctz']),
                    'CbtesAsoc': [
                        {'CbteAsoc': {
                            'Tipo': cbte_asoc['tipo'],
                            'PtoVta': cbte_asoc['pto_vta'], 
                            'Nro': cbte_asoc['nro'],
                            'Cuit': cbte_asoc.get('cuit'),
                        }}
                        for cbte_asoc in f['cbtes_asoc']],
                    'Tributos': [
                        {'Tributo': {
                            'Id': tributo['tributo_id'], 
                            'Desc': tributo['desc'],
                            'BaseImp': float(tributo['base_imp'] or 0),
                            'Alic': float(tributo['alic'] or 0),
                            'Importe': float(tributo['importe']),
                            }}
                        for tributo in f['tributos']],
                    'Iva': [ 
                        {'AlicIva': {
                            'Id': iva['iva_id'],
                            'BaseImp': float(iva['base_imp']),
                            'Importe': float(iva['importe']),
                            }}
                        for iva in f['iva']],
                    'Opcionales': [ 
                        {'Opcional': {
                            'Id': opcional['opcional_id'],
                            'Valor': opcional['valor'],
                            }} for opcional in f['opcionales']],
                    'Compradores': [ 
                        {'Comprador': {
                            'DocTipo': comprador['doc_tipo'],
                            'DocNro': comprador['doc_nro'],
                            'Porcentaje': comprador['porcentaje'],
                            }} for comprador in f['compradores']],
                    }
                verifica(verificaciones, resultget.copy(), difs)
                if difs:
                    print "Diferencias:", difs
                    self.log("Diferencias: %s" % difs)
            else:
                # guardo los datos de AFIP (reconstruyo estructura interna)
                self.factura = {
                    'concepto': resultget.get('Concepto'),
                    'tipo_doc': resultget.get('DocTipo'),
                    'nro_doc': resultget.get('DocNro'),
                    'tipo_cbte': resultget.get('CbteTipo'),
                    'punto_vta': resultget.get('PtoVta'),
                    'cbt_desde': resultget.get('CbteDesde'),
                    'cbt_hasta': resultget.get('CbteHasta'),
                    'fecha_cbte': resultget.get('CbteFch'),
                    'imp_total': resultget.get('ImpTotal'),
                    'imp_tot_conc': resultget.get('ImpTotConc'),
                    'imp_neto': resultget.get('ImpNeto'),
                    'imp_op_ex': resultget.get('ImpOpEx'),
                    'imp_trib': resultget.get('ImpTrib'),
                    'imp_iva': resultget.get('ImpIVA'),
                    'fecha_serv_desde': resultget.get('FchServDesde'),
                    'fecha_serv_hasta': resultget.get('FchServHasta'),
                    'fecha_venc_pago': resultget.get('FchVtoPago'),
                    'moneda_id': resultget.get('MonId'),
                    'moneda_ctz': resultget.get('MonCotiz'),
                    'cbtes_asoc': [
                            {
                            'tipo': cbte_asoc['CbteAsoc']['Tipo'],
                            'pto_vta': cbte_asoc['CbteAsoc']['PtoVta'], 
                            'nro': cbte_asoc['CbteAsoc']['Nro'],
                            'cuit': cbte_asoc['CbteAsoc'].get('Cuit')}
                        for cbte_asoc in resultget.get('CbtesAsoc', [])],
                    'tributos': [
                            {
                            'tributo_id': tributo['Tributo']['Id'], 
                            'desc': tributo['Tributo']['Desc'],
                            'base_imp': tributo['Tributo'].get('BaseImp'),
                            'alic': tributo['Tributo'].get('Alic'),
                            'importe': tributo['Tributo']['Importe'],
                            }
                        for tributo in resultget.get('Tributos', [])],
                    'iva': [ 
                            {
                            'iva_id': iva['AlicIva']['Id'],
                            'base_imp': iva['AlicIva']['BaseImp'],
                            'importe': iva['AlicIva']['Importe'],
                            }
                        for iva in resultget.get('Iva', [])],
                    'opcionales': [ 
                            {
                            'opcional_id': obs['Opcional']['Id'],
                            'valor': obs['Opcional']['Valor'],
                            }
                        for obs in resultget.get('Opcionales', [])],
                    'compradores': [ 
                            {
                            'doc_tipo': comp['Comprador']['DocTipo'],
                            'doc_nro': comp['Comprador']['DocNro'],
                            'porcentaje': comp['Comprador']['Porcentaje'],
                            }
                        for comp in resultget.get('Compradores', [])],
                    'cae': resultget.get('CodAutorizacion'),
                    'resultado': resultget.get('Resultado'),
                    'fch_venc_cae': resultget.get('FchVto'),
                    'obs': [ 
                            {
                            'code': obs['Obs']['Code'],
                            'msg': obs['Obs']['Msg'],
                            }
                        for obs in resultget.get('Observaciones', [])],
                    }
            
            self.FechaCbte = resultget['CbteFch'] #.strftime("%Y/%m/%d")
            self.CbteNro = resultget['CbteHasta'] # 1L
            self.PuntoVenta = resultget['PtoVta'] # 4000
            self.Vencimiento = resultget['FchVto'] #.strftime("%Y/%m/%d")
            self.ImpTotal = str(resultget['ImpTotal'])
            cod_aut = resultget['CodAutorizacion'] and str(resultget['CodAutorizacion']) or ''# 60423794871430L
            self.Resultado = resultget['Resultado']
            self.CbtDesde =resultget['CbteDesde']
            self.CbtHasta = resultget['CbteHasta']
            self.ImpTotal = resultget['ImpTotal']
            self.ImpNeto = resultget['ImpNeto']
            self.ImptoLiq = self.ImpIVA = resultget['ImpIVA']
            self.ImpOpEx = resultget['ImpOpEx']
            self.ImpTrib = resultget['ImpTrib']
            self.EmisionTipo = resultget['EmisionTipo']
            if self.EmisionTipo=='CAE':
                self.CAE = cod_aut
            elif self.EmisionTipo=='CAEA':
                self.CAEA = cod_aut
            # Obs:
            for obs in resultget.get('Observaciones', []):
                self.Observaciones.append("%(Code)s: %(Msg)s" % (obs['Obs']))
            self.Obs = '\n'.join(self.Observaciones)

        self.__analizar_errores(result)
        if not difs:
            return self.CAE or self.CAEA
        else:
            return ''


    @inicializar_y_capturar_excepciones
    def CAESolicitarX(self):
        "Autorizar m�ltiples facturas (CAE) en una �nica solicitud"
        # Ver CompTotXRequest -> cantidad maxima comprobantes (250)
        # verificar que hay multiples facturas:
        if not self.facturas:
            raise RuntimeError("Llamar a IniciarFacturasX y AgregarFacturaX!")
        # verificar que todas las facturas
        puntos_vta = set([f['punto_vta'] for f in self.facturas])
        tipos_cbte = set([f['tipo_cbte'] for f in self.facturas])
        if len(puntos_vta) > 1:
            raise RuntimeError("Los comprobantes deben ser del mismo pto_vta!")
        if len(tipos_cbte) > 1:
            raise RuntimeError("Los comprobantes deben tener el mismo tipo!")
        # llamar al webservice:
        ret = self.client.FECAESolicitar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            FeCAEReq={
                'FeCabReq': {'CantReg': len(self.facturas), 
                    'PtoVta': puntos_vta.pop(), 
                    'CbteTipo': tipos_cbte.pop()},
                'FeDetReq': [{'FECAEDetRequest': {
                    'Concepto': f['concepto'],
                    'DocTipo': f['tipo_doc'],
                    'DocNro': f['nro_doc'],
                    'CbteDesde': f['cbt_desde'],
                    'CbteHasta': f['cbt_hasta'],
                    'CbteFch': f['fecha_cbte'],
                    'ImpTotal': f['imp_total'],
                    'ImpTotConc': f['imp_tot_conc'],
                    'ImpNeto': f['imp_neto'],
                    'ImpOpEx': f['imp_op_ex'],
                    'ImpTrib': f['imp_trib'],
                    'ImpIVA': f['imp_iva'],
                    # Fechas solo se informan si Concepto in (2,3)
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f.get('fecha_venc_pago'),
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f['fecha_venc_pago'],
                    'MonId': f['moneda_id'],
                    'MonCotiz': f['moneda_ctz'],                
                    'CbtesAsoc': [
                        {'CbteAsoc': {
                            'Tipo': cbte_asoc['tipo'],
                            'PtoVta': cbte_asoc['pto_vta'], 
                            'Nro': cbte_asoc['nro'],
                            'Cuit': cbte_asoc.get('cuit'),
                        }}
                        for cbte_asoc in f['cbtes_asoc']] or None,
                    'Tributos': [
                        {'Tributo': {
                            'Id': tributo['tributo_id'], 
                            'Desc': tributo['desc'],
                            'BaseImp': tributo['base_imp'],
                            'Alic': tributo['alic'],
                            'Importe': tributo['importe'],
                            }}
                        for tributo in f['tributos']] or None,
                    'Iva': [ 
                        {'AlicIva': {
                            'Id': iva['iva_id'],
                            'BaseImp': iva['base_imp'],
                            'Importe': iva['importe'],
                            }}
                        for iva in f['iva']] or None,
                    'Opcionales': [ 
                        {'Opcional': {
                            'Id': opcional['opcional_id'],
                            'Valor': opcional['valor'],
                            }} for opcional in f['opcionales']] or None,
                    }
                } for f in self.facturas]
            })
        
        result = ret['FECAESolicitarResult']
        if 'FeCabResp' in result:
            fecabresp = result['FeCabResp']
            for i, fedetresp in enumerate(result['FeDetResp']):
                fedetresp = fedetresp['FECAEDetResponse']
                f = self.facturas[i]
                # actualizar los campos devueltos por AFIP para cada comp.
                f["resultado"] = fedetresp['Resultado']
                f["cae"] = fedetresp['CAE'] and str(fedetresp['CAE']) or ""
                f["emision_tipo"] = 'CAE'
                f["fch_venc_cae"] = fedetresp['CAEFchVto']
                f["obs"] = [
                        {'code': obs['Obs']['Code'], 'msg': obs['Obs']['Msg']}
                        for obs in fedetresp.get('Observaciones', [])]
                # sanity checks:
                assert str(f["fecha_cbte"]) == str(fedetresp['CbteFch'])
                assert str(f["cbt_desde"]) == str(fedetresp['CbteDesde'])
                assert str(f["cbt_hasta"]) == str(fedetresp['CbteHasta'])
                assert str(f["punto_vta"]) == str(fecabresp['PtoVta'])
                assert str(f["tipo_cbte"]) == str(fecabresp['CbteTipo'])
                assert str(f["tipo_doc"]) == str(fedetresp['DocTipo'])
                assert str(f["nro_doc"]) == str(fedetresp['DocNro'])
                assert str(f["concepto"]) == str(fedetresp['Concepto'])

            self.__analizar_errores(result)
            assert fecabresp['CantReg'] == len(self.facturas)
        return fecabresp['CantReg']

    # metodos auxiliares para soporte de multiples comprobantes por solicitud:

    def IniciarFacturasX(self):
        "Inicializa lista de facturas para Solicitar multiples CAE"
        self.facturas = []
        return True

    def AgregarFacturaX(self):
        "Agrega una factura a la lista para Solicitar multiples CAE"
        self.facturas.append(self.factura)
        return True

    def LeerFacturaX(self, i):
        "Activa internamente una factura para usar ObtenerCampoFactura"
        try:
            # obtengo la factura segun el indice en la lista:
            f = self.factura = self.facturas[i]
            # completar propiedades para retro-compatibilidad:
            self.FechaCbte = f['fecha_cbte']
            self.PuntoVenta = f['punto_vta']
            self.Vencimiento = f['fch_venc_cae']
            self.Resultado = f['resultado']
            self.CbtDesde =f['cbt_desde']
            self.CbtHasta = f['cbt_hasta']
            self.ImpTotal = str(f['imp_total'])
            self.ImpNeto = str(f.get('imp_neto'))
            self.ImptoLiq = self.ImpIVA = str(f.get('imp_iva'))
            self.ImpOpEx = str(f.get('imp_op_ex'))
            self.ImpTrib = str(f.get('imp_trib'))
            self.EmisionTipo = f['emision_tipo']
            if self.EmisionTipo=='CAE':
                self.CAE = f['cae']
            elif self.EmisionTipo=='CAEA':
                self.CAEA = f['caea']
            # Obs:
            self.Observaciones = []
            for obs in f.get('obs', []):
                self.Observaciones.append("%(code)s: %(msg)s" % (obs))
            self.Obs = '\n'.join(self.Observaciones)
            return True
        except:
            return False

    # metodos para CAEA:

    @inicializar_y_capturar_excepciones
    def CAEASolicitar(self, periodo, orden):
        ret = self.client.FECAEASolicitar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            Periodo=periodo, 
            Orden=orden,
            )
        
        result = ret['FECAEASolicitarResult']
        self.__analizar_errores(result)

        if 'ResultGet' in result:
            result = result['ResultGet']
            if 'CAEA' in result:
                self.CAEA = result['CAEA']
                self.Periodo = result['Periodo']
                self.Orden = result['Orden']
                self.FchVigDesde = result['FchVigDesde']
                self.FchVigHasta = result['FchVigHasta']
                self.FchTopeInf = result['FchTopeInf']
                self.FchProceso = result['FchProceso']
                # Obs (COMPGv28):
                for obs in result.get('Observaciones', []):
                    self.Observaciones.append("%(Code)s: %(Msg)s" % (obs['Obs']))
                self.Obs = '\n'.join(self.Observaciones)

        return self.CAEA and str(self.CAEA) or ''


    @inicializar_y_capturar_excepciones
    def CAEAConsultar(self, periodo, orden):
        "M�todo de consulta de CAEA"
        ret = self.client.FECAEAConsultar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            Periodo=periodo, 
            Orden=orden,
            )
        
        result = ret['FECAEAConsultarResult']
        self.__analizar_errores(result)

        if 'ResultGet' in result:
            result = result['ResultGet']
            if 'CAEA' in result:
                self.CAEA = result['CAEA']
                self.Periodo = result['Periodo']
                self.Orden = result['Orden']
                self.FchVigDesde = result['FchVigDesde']
                self.FchVigHasta = result['FchVigHasta']
                self.FchTopeInf = result['FchTopeInf']
                self.FchProceso = result['FchProceso']

        return self.CAEA and str(self.CAEA) or ''
    
    @inicializar_y_capturar_excepciones
    def CAEARegInformativo(self):
        "M�todo para informar comprobantes emitidos con CAEA"
        f = self.factura
        ret = self.client.FECAEARegInformativo(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            FeCAEARegInfReq={
                'FeCabReq': {'CantReg': 1, 
                    'PtoVta': f['punto_vta'], 
                    'CbteTipo': f['tipo_cbte']},
                'FeDetReq': [{'FECAEADetRequest': {
                    'Concepto': f['concepto'],
                    'DocTipo': f['tipo_doc'],
                    'DocNro': f['nro_doc'],
                    'CbteDesde': f['cbt_desde'],
                    'CbteHasta': f['cbt_hasta'],
                    'CbteFch': f['fecha_cbte'],
                    'ImpTotal': f['imp_total'],
                    'ImpTotConc': f['imp_tot_conc'],
                    'ImpNeto': f['imp_neto'],
                    'ImpOpEx': f['imp_op_ex'],
                    'ImpTrib': f['imp_trib'],
                    'ImpIVA': f['imp_iva'],
                    # Fechas solo se informan si Concepto in (2,3)
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f.get('fecha_venc_pago'),
                    'FchServDesde': f.get('fecha_serv_desde'),
                    'FchServHasta': f.get('fecha_serv_hasta'),
                    'FchVtoPago': f['fecha_venc_pago'],
                    'MonId': f['moneda_id'],
                    'MonCotiz': f['moneda_ctz'],                
                    'CbtesAsoc': [
                        {'CbteAsoc': {
                            'Tipo': cbte_asoc['tipo'],
                            'PtoVta': cbte_asoc['pto_vta'], 
                            'Nro': cbte_asoc['nro'],
                            'Cuit': cbte_asoc.get('cuit'),
                        }}
                        for cbte_asoc in f['cbtes_asoc']]
                        if f['cbtes_asoc'] else None,
                    'Tributos': [
                        {'Tributo': {
                            'Id': tributo['tributo_id'], 
                            'Desc': tributo['desc'],
                            'BaseImp': tributo['base_imp'],
                            'Alic': tributo['alic'],
                            'Importe': tributo['importe'],
                            }}
                        for tributo in f['tributos']] 
                        if f['tributos'] else None,
                    'Iva': [ 
                        {'AlicIva': {
                            'Id': iva['iva_id'],
                            'BaseImp': iva['base_imp'],
                            'Importe': iva['importe'],
                            }}
                        for iva in f['iva']]
                        if f['iva'] else None,
                    'CAEA': f['caea'],
                    }
                }]
            })
        
        result = ret['FECAEARegInformativoResult']
        if 'FeCabResp' in result:
            fecabresp = result['FeCabResp']
            fedetresp = result['FeDetResp'][0]['FECAEADetResponse']
            
            # Reprocesar en caso de error (recuperar CAE emitido anteriormente)
            if self.Reprocesar and 'Errors' in result:
                for error in result['Errors']:
                    err_code = str(error['Err']['Code'])
                    if fedetresp['Resultado']=='R' and err_code=='703':
                        caea = self.CompConsultar(f['tipo_cbte'], f['punto_vta'], f['cbt_desde'], reproceso=True)
                        if caea and self.EmisionTipo=='CAE':
                            self.Reproceso = 'S'
                            return caea
                        self.Reproceso = 'N'

            self.Resultado = fecabresp['Resultado']
            # Obs:
            for obs in fedetresp.get('Observaciones', []):
                self.Observaciones.append("%(Code)s: %(Msg)s" % (obs['Obs']))
            self.Obs = '\n'.join(self.Observaciones)
            self.CAEA = fedetresp['CAEA'] and str(fedetresp['CAEA']) or ""
            self.EmisionTipo = 'CAEA'
            self.FechaCbte = fedetresp['CbteFch'] #.strftime("%Y/%m/%d")
            self.CbteNro = fedetresp['CbteHasta'] # 1L
            self.PuntoVenta = fecabresp['PtoVta'] # 4000
            self.CbtDesde =fedetresp['CbteDesde']
            self.CbtHasta = fedetresp['CbteHasta']
            self.__analizar_errores(result)
        return self.CAEA

    @inicializar_y_capturar_excepciones
    def CAEASinMovimientoInformar(self, punto_vta, caea):
        "M�todo  para informar CAEA sin movimiento"
        ret = self.client.FECAEASinMovimientoInformar(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            PtoVta=punto_vta, 
            CAEA=caea,
            )
        
        result = ret['FECAEASinMovimientoInformarResult']
        self.__analizar_errores(result)

        if 'CAEA' in result:
            self.CAEA = result['CAEA']
        if 'FchProceso' in result:
            self.FchProceso = result['FchProceso']
        if 'Resultado' in result:
            self.Resultado = result['Resultado']
            self.PuntoVenta = result['PtoVta'] # 4000

        return self.Resultado or ''
    
    @inicializar_y_capturar_excepciones
    def ParamGetTiposCbte(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de Comprobantes"
        ret = self.client.FEParamGetTiposCbte(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposCbteResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['CbteTipo']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposConcepto(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de Conceptos"
        ret = self.client.FEParamGetTiposConcepto(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposConceptoResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['ConceptoTipo']).replace("\t", sep)
                 for p in res['ResultGet']]
                

    @inicializar_y_capturar_excepciones
    def ParamGetTiposDoc(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de Documentos"
        ret = self.client.FEParamGetTiposDoc(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposDocResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['DocTipo']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposIva(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de Al�cuotas"
        ret = self.client.FEParamGetTiposIva(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposIvaResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['IvaTipo']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposMonedas(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Monedas"
        ret = self.client.FEParamGetTiposMonedas(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposMonedasResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['Moneda']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposOpcional(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de datos opcionales"
        ret = self.client.FEParamGetTiposOpcional(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposOpcionalResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['OpcionalTipo']).replace("\t", sep)
                 for p in res.get('ResultGet', [])]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposTributos(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Tipos de Tributos"
        "Este m�todo permite consultar los tipos de tributos habilitados en este WS"
        ret = self.client.FEParamGetTiposTributos(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposTributosResult']
        return [(u"%(Id)s\t%(Desc)s\t%(FchDesde)s\t%(FchHasta)s" % p['TributoTipo']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetTiposPaises(self, sep="|"):
        "Recuperador de valores referenciales de c�digos de Paises"
        "Este m�todo permite consultar los tipos de tributos habilitados en este WS"
        ret = self.client.FEParamGetTiposPaises(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret['FEParamGetTiposPaisesResult']
        return [(u"%(Id)s\t%(Desc)s" % p['PaisTipo']).replace("\t", sep)
                 for p in res['ResultGet']]

    @inicializar_y_capturar_excepciones
    def ParamGetCotizacion(self, moneda_id):
        "Recuperador de cotizaci�n de moneda"
        ret = self.client.FEParamGetCotizacion(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            MonId=moneda_id,
            )
        self.__analizar_errores(ret)
        res = ret['FEParamGetCotizacionResult']['ResultGet']
        return str(res.get('MonCotiz',""))
        
    @inicializar_y_capturar_excepciones
    def ParamGetPtosVenta(self, sep="|"):
        "Recuperador de valores referenciales Puntos de Venta registrados"
        ret = self.client.FEParamGetPtosVenta(
            Auth={'Token': self.Token, 'Sign': self.Sign, 'Cuit': self.Cuit},
            )
        res = ret.get('FEParamGetPtosVentaResult', {})
        return [(u"%(Nro)s\tEmisionTipo:%(EmisionTipo)s\tBloqueado:%(Bloqueado)s\tFchBaja:%(FchBaja)s" % p['PtoVenta']).replace("\t", sep)
                 for p in res.get('ResultGet', [])]

  
def p_assert_eq(a,b):
    print a, a==b and '==' or '!=', b

    
INSTALL_DIR = WSFEv1.InstallDir = get_install_dir()