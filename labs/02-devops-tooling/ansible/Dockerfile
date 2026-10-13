FROM python:3.13-slim
RUN pip install --no-cache-dir "ansible-core>=2.19,<2.20"
WORKDIR /work
ENTRYPOINT ["ansible-playbook"]
