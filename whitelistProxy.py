import requests

http_proxy  = "http://91.93.163.188:8080"
https_proxy = "https://91.93.163.188:8080"
ftp_proxy   = "ftp://91.93.163.188:8080"


file1 = open('socks5.txt', 'r')
count = 0
 
# Using for loop
print("Using for loop")
for line in file1:
	count += 1
	print("Line{}: {}".format(count, line.strip()))
	r = requests.get("https://f.zillyhuhn.com", proxies={"https": "https://"+line.strip()})
	print(r)