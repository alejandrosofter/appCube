import os
import sys


dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(dir_path+"/../")
from config import db

path_cetificado=dir_path+"/certificado.crt";
path_privada=dir_path+"/privada.key";

data_certificado=str(sys.argv[1])
data_privada=str(sys.argv[2])

db.settings.update_one({"clave":"privada_fe"},{"$set":{"valor":data_privada}});
db.settings.update_one({"clave":"certificado_fe"},{"$set":{"valor":data_certificado}});

file = open(path_cetificado, "w") 
file.write(data_certificado)

file = open(path_privada, "w") 
file.write(data_privada)