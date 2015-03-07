#!/bin/zsh
#Workaround for
sudo add-apt-repository ppa:pg-radadia/tmux-stable

apt-get update
apt-get upgrade
apt-get install zsh git nodejs npm ruby
apt-get install nodejs-legacy

chsh -s /usr/bin/zsh

#Install oh-my-zsh
curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sudo sh

npm install -g cordova ionic

PATH="`ruby -e 'puts Gem.user_dir'`/bin:$PATH"

gem install tmuxinator

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list

sudo apt-get install -y mongodb-org

mkdir ~/.tmuxinator
cp ~/nan-codefest/.tmuxinator/server.yml ~/.tmuxinator/server.yml
cp ~/nan-codefest/.tmuxinator/tmux.conf ~/.tmux.conf

cd ~
mkdir .bin
cd ~/.bin
curl -O https://github.com/tmuxinator/tmuxinator/raw/master/bin/tmuxinator

mkdir ~/mongodb
mkdir ~/mongodb/db
mkdir ~/log/
mkdir ~/log/mongodb/
mkdir ~/log/nodejs
