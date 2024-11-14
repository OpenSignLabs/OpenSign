#!/bin/bash

create_ssl_cert() {
    mkdir -p ./certs

    CERT_FILE="certs/$FQDN.crt"
    KEY_FILE="certs/$FQDN.key"
    CSR_FILE="certs/$FQDN.csr"

    openssl genpkey -algorithm RSA -out "$KEY_FILE" -aes256 -pass pass:"$PASS"

    openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -passin pass:"$PASS" -subj "/CN=$FQDN"

    openssl x509 -req -in "$CSR_FILE" -signkey "$KEY_FILE" -out "$CERT_FILE" -days 365 -passin pass:"$PASS"

    echo "SSL Certificate and Key have been generated successfully!"
    echo "Certificate: $CERT_FILE"
    echo "Private Key: $KEY_FILE"

    rm "$CSR_FILE"
}

read -p "Enter the Fully Qualified Domain Name (FQDN): " FQDN

if [ -z "$FQDN" ]; then
    echo "Error: You must provide a Fully Qualified Domain Name (FQDN)."
    exit 1
fi


read -sp "Enter a password for your SSL private key: " PASS
echo


if [ -z "$PASS" ]; then
    echo "Error: You must provide a password."
    exit 1
fi

create_ssl_cert
