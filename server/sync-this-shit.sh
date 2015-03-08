git add -A
git commit -m $1
git push origin database
git checkout master
git pull
git merge database
git push origin master
git checkout database
