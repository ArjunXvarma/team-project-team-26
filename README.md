## Current Status of tests
[![Automated Testing config for continuous integration (CI)](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/actions/workflows/ci.yaml/badge.svg?branch=shubham-dev)](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/actions/workflows/ci.yaml)


## Run Next.js Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Run the Flask server locally

The following steps are required to setup and run the flask app locally. 

### Create a Virtual Environment

```
python<version> -m venv <virtual-environment-name>
 
```

### Activate the Virtual Enviroment

```
source <virtual-environment-name>/bin/activate
```

> [!IMPORTANT]
> Please make sure the terminal has the virtual name before every command:

```
 (<virtual-environment-name>) command_line
```

### Install all the required dependencies

The following command will download all the required dependencies for running the flask app.
```
 pip3 install -r requirements.txt
```


### Start the flask app

The following 2 commands can be used to start the flask app:

```
python<version> run.py
```
or 
```
flask run
```

## Database Operations
The following commands can be used to create a new database or update the database.

### Create an empty database

The following command will create a new database using the tables defined in models.py

```
 python<version> db_create.py
```

### Update the database structure

The following commands will update the database with the new changes as defined in models.py.

```
 1. flask db init
 2. flask db migrate -m <appropriate description of the changes made>
 3. flask db upgrade
```


how to
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Nrqv5LcV)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=13770086&assignment_repo_type=AssignmentRepo)
