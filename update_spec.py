
import os
import sys
import subprocess

if len(sys.argv) < 2:
    print 'proper usage: npm run api <branch>'
    print '  replace <branch> with your desired branch name'
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

subprocess.call(['git', 'checkout', sys.argv[1]])
subprocess.call(['git', 'pull'])
os.chdir('../..')
subprocess.call(['npm', 'install'])
subprocess.call(['npm', 'run', 'build'])
subprocess.call(['cp', 'dist/js/SDL.min.js', '../public/.'])

subprocess.call(['sed', '-i', 's:var branch = \'.*\';:var branch = \'' + sys.argv[1] + '\';:', '../src/components/AppConnection.vue'])