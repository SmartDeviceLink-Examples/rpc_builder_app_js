import os
import sys
import subprocess

if len(sys.argv) < 2:
    print 'proper usage: npm run api <remote> <branch> [repo_owner]'
    print '  replace <remote> with the git remote name (origin)'
    print '  replace <branch> with your desired branch name (develop)'
    print '  replace [repo_owner] with the owner of the rpc_spec repo (smartdevicelink)'
    exit()

if not os.path.isdir('sdl_javascript_suite/'):
    subprocess.call(['git', 'submodule', 'init'])
    subprocess.call(['git', 'submodule', 'update'])

os.chdir('sdl_javascript_suite/')
subprocess.call(['git', 'fetch'])

if not os.path.isdir('sdl_javascript_suite/lib/rpc_spec'):
    subprocess.call(['git', 'submodule', 'init'])
    subprocess.call(['git', 'submodule', 'update'])

os.chdir('lib/rpc_spec')
subprocess.call(['git', 'checkout', '--track', sys.argv[1] + '/' + sys.argv[2]])
subprocess.call(['git', 'checkout', sys.argv[2]])
subprocess.call(['git', 'pull'])

os.chdir('../..')
subprocess.call(['npm', 'install'])
subprocess.call(['npm', 'run', 'build'])

if os.path.isfile('lib/js/dist/SDL.min.js'):
    subprocess.call(['cp', 'lib/js/dist/SDL.min.js', '../public/.'])
elif os.path.isfile('dist/js/SDL.min.js'):
    subprocess.call(['cp', 'dist/js/SDL.min.js', '../public/.'])
else:
    print('ERROR: could not find SDL.min.js file from JS suite build!')
    exit()

sed_remote_args = ['sed', '-i', '-e', 's:var remote = \'.*\';:var remote = \'' + sys.argv[3] + '\';:', '../src/components/AppConnection.vue']
sed_branch_args = ['sed', '-i', '-e', 's:var branch = \'.*\';:var branch = \'' + sys.argv[2] + '\';:', '../src/components/AppConnection.vue']

import platform
if platform.system() == 'Darwin':
    sed_remote_args.insert(2, '')
    sed_branch_args.insert(2, '')

if len(sys.argv) > 3:
    subprocess.call(sed_remote_args)
subprocess.call(sed_branch_args)
