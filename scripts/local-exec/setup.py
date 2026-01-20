from pathlib import Path
from os import chdir, remove
from subprocess import run
from yaml import safe_load
from json import dump, loads

SETUP_VARS_FILE = "setup-vars.auto.tfvars.json"
PROJECT_VARS_FILE = "project-vars.auto.tfvars.json"

script_dir = Path(__file__).parent.resolve()
chdir(script_dir)

with open('variables.yaml', 'r') as variables:
    config = safe_load(variables)

setup_vars = config['setup']
project_vars = config['project']

chdir("../../setup")

with open(SETUP_VARS_FILE, 'w') as setup_vars_file:
    dump(setup_vars, setup_vars_file, indent=4)

run(['tofu', 'apply', '--auto-approve'], check=True)

remove(SETUP_VARS_FILE)

setup_output_result = run(
    ['tofu', 'output', '-json'],
    check=True,
    capture_output=True,
    text=True
)
setup_outputs = loads(setup_output_result.stdout)
setup_output_values = { key: value ['value'] for key, value in setup_outputs.items() }

project_vars.update(setup_output_values)


