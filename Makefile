bootstrap:
	cp -r node_modules/bootstrap/less/* assets/less/bootstrap
	cp -r node_modules/bootstrap/fonts public/fonts

tunnel:
	ssh -L 9002:127.0.0.1:8080 destroy.email

.PHONY: bootstrap tunnel
