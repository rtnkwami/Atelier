import boto3
import sys
import os

ecs = boto3.client('ecs')

cluster_name = os.environ['CLUSTER_NAME']
service_name = os.environ['SERVICE_NAME']

# Get service details
service = ecs.describe_services(
    cluster=cluster_name,
    services=[service_name]
)['services'][0]

# Get container name from task definition
task_def = ecs.describe_task_definition(
    taskDefinition=service['taskDefinition']
)['taskDefinition']

container_name = task_def['containerDefinitions'][0]['name']

# Run migration task
response = ecs.run_task(
    cluster=cluster_name,
    taskDefinition=service['taskDefinition'],
    launchType=service['launchType'],
    networkConfiguration=service['networkConfiguration'],
    overrides={
        'containerOverrides': [{
            'name': container_name,
            'command': ['npx', 'prisma', 'migrate', 'deploy']
        }]
    }
)

task_arn = response['tasks'][0]['taskArn']
print(f"Migration task started: {task_arn}")

# Wait for completion
waiter = ecs.get_waiter('tasks_stopped')
waiter.wait(cluster=cluster_name, tasks=[task_arn])

# Check result
task = ecs.describe_tasks(cluster=cluster_name, tasks=[task_arn])['tasks'][0]
exit_code = task['containers'][0]['exitCode']

if exit_code != 0:
    print(f"Migration failed with exit code {exit_code}")
    sys.exit(1)

print("Migration completed successfully")