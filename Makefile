_:
	node index.js

priv:
	doas setcap 'cap_net_bind_service=+ep' `which node`
