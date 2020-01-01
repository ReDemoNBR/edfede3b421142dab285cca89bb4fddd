#!/bin/bash

node --harmony exec/create-tables.js
[[ $? -ne 0 ]] && exit 1

node --harmony server