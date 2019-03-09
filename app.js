const fs = require('fs')
const _ = require('lodash')

const gamesDirectory = '/Volumes/SONY/games'

function run () {
  const folders = _.filter(fs.readdirSync(gamesDirectory), folder => !_.startsWith(folder, '.'))
  const games = _.map(folders, getGameNameInDirectory)
  const sortedGames = _.sortBy(games, ['firstGameWord', 'year'])

  const toProcess = applyTempFolderNames(sortedGames)
  renameTempFolders(toProcess)
}

function getGameNameInDirectory (folder) {
  const gameInfoFilePath = `${gamesDirectory}/${folder}/GameData/Game.ini`
  const gameInfo = fs.readFileSync(gameInfoFilePath).toString()
  const lines = gameInfo.split('\n')
  const game = getValueBetweenQuotes(lines[1])
  const year = parseInt(getValueAfterEquals(lines[3]), 10)

  return {
    folder,
    game,
    year, 
    firstGameWord: game.split(' ')[0]
  }
}

function applyTempFolderNames (sortedGames) {
  return _.map(sortedGames, (game, index) => {
    const folder = `${index + 1}`
    const gameDir = `${gamesDirectory}/${game.folder}`
    const tempDir = `${gamesDirectory}/_${folder}`
    fs.renameSync(gameDir, tempDir)
    return {
      tempDir,
      finalDir: `${gamesDirectory}/${folder}`
    }
  })
}

function renameTempFolders (tempFolders) {
  _.each(tempFolders, (folderToProcess) => {
    fs.renameSync(folderToProcess.tempDir, folderToProcess.finalDir)
  })
}

function getValueBetweenQuotes(string) {
  return string.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, '');
}

function getValueAfterEquals(string) {
  return string.split('=')[1]
}

run()