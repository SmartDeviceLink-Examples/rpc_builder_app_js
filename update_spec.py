
import os
import sys
import subprocess

if len(sys.argv) < 2:
    print 'proper usage: npm run api <branch>'
    print '  replace <branch> with your desired branch name'
    exit()

os.chdir('sdl_javascript_suite/lib/rpc_spec')
subprocess.call(['git', 'fetch'])
subprocess.call(['git', 'checkout', sys.argv[1]])
subprocess.call(['git', 'pull'])
os.chdir('../..')
subprocess.call(['npm', 'install'])
subprocess.call(['npm', 'run', 'build'])
subprocess.call(['cp', 'dist/js/SDL.min.js', '../public/.'])

subprocess.call(['sed', '-i', 's:var branch = \'.*\';:var branch = \'' + sys.argv[1] + '\';:', '../src/components/AppConnection.vue'])