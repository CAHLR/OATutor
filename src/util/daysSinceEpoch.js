export default function daysSinceEpoch(){
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24))
}
