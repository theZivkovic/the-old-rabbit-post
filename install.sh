#!/bin/bash

cd consumer && npm install && cd ..;
cd producer && npm install && cd ..;
cd dead-letter-flusher && npm install && cd ..;