 #!/bin/bash   
sudo apt-get install git
sudo apt-get update
sudo apt-get install python3-dateutil
sudo apt-get install python3-setuptools
sudo apt-get install python3-dev
sudo apt-get install libevent-dev
sudo apt-get install ncureses-dev
git clone https://github.com/tgalal/yowsup
cd yowsup
python3 setup.py install
#editar el archivo yowsup/env/env_android.py y cambiar:
#MD5CLASES=3jYxFPSrhqjabEm5b2sXhA==
#VERSION=2.17.279
#yowsup-cli registration --requestcode sms --phone 54XXXXXXXX --cc 54 --mcc 722 --mnc 01
#yowsup-cli registration --register xxxxxx --phone 54XXXXXXXX --cc 54 --mcc 722 --mnc 01
#pss=rnmEEtyOKqLj68Qa/TNXpTZmGOY=
#log=5492975072516