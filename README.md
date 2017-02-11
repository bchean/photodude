# photodude - a simple photo labeler

## what is it?

photodude is a simple web app for labeling photos on your local hard drive. i built it as an exercise in learning Flask and Backbone.

## running the app

```
# clone
git clone https://github.com/bchean/photodude.git

# install
cd photodude/server
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt

# configure
echo "PHOTO_DIR = '/absolute/dir/to/photos'" > config.py

# run
./run.sh
```

## dev workflow

```
# run watch-deploy scripts
cd photodude/ui-dev
npm watch-apps
```
