import boto3
import sys
import os

ecs = boto3.client('ecs')

cluster_name = os.environ['CLUSTER_NAME']
service_name = os.environ['SERVICE_NAME']

service = ecs.describe_services(
    cluster=cluster_name,
    services=[service_name]
)['services'][0]

task_def = ecs.describe_task_definition(
    taskDefinition=service['taskDefinition']
)['taskDefinition']

container_name = task_def['containerDefinitions'][0]['name']

response = ecs.run_task(
    cluster=cluster_name,
    taskDefinition=service['taskDefinition'],
    launchType=service['launchType'],
    networkConfiguration=service['networkConfiguration'],
    overrides={
        'containerOverrides': [{
            'name': container_name,
            'command': ['node', 'dist/seed.js']
        }]
    }
)

task_arn = response['tasks'][0]['taskArn']

waiter = ecs.get_waiter('tasks_stopped')
waiter.wait(cluster=cluster_name, tasks=[task_arn])

task = ecs.describe_tasks(cluster=cluster_name, tasks=[task_arn])['tasks'][0]
exit_code = task['containers'][0]['exitCode']

if exit_code != 0:
    sys.exit(1)