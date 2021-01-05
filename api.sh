
if [ -z $1 ] || [ -z $2 ] || [ -z $3 ]
then
    echo "usage: npm run api origin smartdevicelink develop"
    exit 1
fi

LOCAL_REMOTE_NAME=$1
GH_REMOTE_NAME=$2
BRANCH=$3

if [ ! -d "sdl_javascript_suite" ]
then
    git clone --recurse-submodules -b develop https://github.com/smartdevicelink/sdl_javascript_suite.git
elif [ ! -d "sdl_javascript_suite/lib/rpc_spec" ]
then
    cd sdl_javascript_suite
    git submodule init
    git submodule update
    cd ..
fi

cd sdl_javascript_suite/lib/rpc_spec
git fetch
git checkout --track $LOCAL_REMOTE_NAME/$BRANCH
git checkout $BRANCH
python3 -m pip install -r InterfaceParser/requirements.txt
git pull

cd ../..

npm install
npm run build

if [ -f "lib/js/dist/SDL.min.js" ]
then
    cp lib/js/dist/SDL.min.js ../src/public/.
elif [ -f "dist/js/SDL.min.js" ]
then
    cp dist/js/SDL.min.js ../src/public/.
else
    echo "ERROR: could not find compiled SDL.min.js!"
    exit 2
fi

if [[ "$OSTYPE" == "darwin"* ]]
then
    sed -i "" -e "1s;^;/* eslint-disable */ ;" src/public/SDL.min.js
    sed -i "" -e "s:var remote = \'.*\';:var remote = \'$GH_REMOTE_NAME\';:" ../src/components/MenuBar.jsx
    sed -i "" -e "s:var branch = \'.*\';:var branch = \'$BRANCH\';:" ../src/components/MenuBar.jsx
else
    sed -i -e "1s;^;/* eslint-disable */ ;" ../src/public/SDL.min.js
    sed -i -e "s:var remote = \'.*\';:var remote = \'$GH_REMOTE_NAME\';:" ../src/components/MenuBar.jsx
    sed -i -e "s:var branch = \'.*\';:var branch = \'$BRANCH\';:" ../src/components/MenuBar.jsx
fi
