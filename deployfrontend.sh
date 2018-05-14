#rsync -r src/ docs/
rsync build/contracts/Chainlist.json src/
#rsync build/contracts/Chainlist.json .
git add .
git commit -m "adding server files"
git push origin master