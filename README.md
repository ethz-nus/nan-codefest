# [Getaway](http://178.62.185.207) [![Code Climate](http://img.shields.io/codeclimate/github/ethz-nus/nan-codefest.svg)](https://codeclimate.com/github/ethz-nus/nan-codefest) [![Dependency Status](http://img.shields.io/david/ethz-nus/nan-codefest.svg)](https://david-dm.org/ethz-nus/nan-codefest.svg) [![devDependency Status](http://img.shields.io/david/dev/ethz-nus/nan-codefest.svg)](https://david-dm.org/ethz-nus/nan-codefest.svg#info=devDependencies)

## Setup

We're using Ubuntu. On a fresh installation, login as root and run

  ```sh
  ./setup.sh
  ```

## Webapp

  We maintain a tmux instance. This script should run at startup via cron

  ```sh
  tmuxinator start server
  ```

  To update tmux script, just run

  ```sh
  cp ~/nan-codefest/.tmuxinator/server.yml ~/.tmuxinator/server.yml
  ```


## Testing

  ```sh
  ionic build ios
  ionic emulate ios
  ```
