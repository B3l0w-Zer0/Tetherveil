import { getWildMonst, getCollection, getTeam } from '/src/player/monsterlogic.js'
import { getAllAttacks, getAttacks, saveAttacks, getAttackInfo } from 'src/fight/GeneralAttackLogic'


export async function damageEffectCalc (attackStat, defenseStat, attackID) {
    const attack = await getAttackInfo(attackID);

    let damage = attackStat * (attackStat / (attackStat + defenseStat))
 return damage;
}

export function doActiveOwnMonstDamage(surrogateID, enemySurrogateID, attack) {

    const collection = getCollection();

    const team = getTeam();

    const wildMons = getWildMonst();

    const allAttacks = getAllAttacks(); //todo schreibe noch attackenlogik um alle Attacken in zugehöriger json abzurufen und schreibe Attacken zuweise, entferne und tausche Logik

    //benötigte Funktionen: getAllAttacks(), getAttackInfo(attackID), addAttackToWildMonst(surrogateID, attackID), removeAttackFromWildMonst(surrogateID, attackID),
}
function switchAttackFromWildMonst(surrogateID, attackID, switchedAttackID){

}

    addAttackToCollectionMonst(surrogateID, attackID), removeAttackFromCollectionMonst(surrogateID, attackID), switchAttackFromMmonst(surrogateID, attackID, switchedAttackID)







//todo: MAJOR ENTWICKLUNG! Maybe geht es, alle getMethoden in einem Zugriff zu laden und dann je nachdem unabhängig von team, Collection und wildMonst die surrogateID zu suchen. Weil entweder ist sie in der Collection, in der Collection und team oder nur in wild Monsters. Weil alle unique sind, kann man alle in eins laden und dann einfach suchen und schauen, wo man es her hat und dann mit switch case je nach bedarf wieder in wild Monsters, Collection oder Collection und team speichern. Dann einfach ein Attribut in der Funktion mitgeben, was dann als Unterscheidung gilt. Nur etwas mehr aufwand um umzuschreiben aber variable Funktion die nur einmal den code drin stehen hat, der sich ja außer dem listenaufruf am anfang durch getcollection etc fast gleich ist



    let ownHealth

    let enemyHealth

    let collectionMonst

    let teamMonst

    let enemyMonst

    let dealtDamage





    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID);

    if(collectionMonstIndex === -1){

        console.error("Monster: ", surrogateID, " was not found in Collection!")

        return null;

    } else {

        collectionMonst = collection[collectionMonstIndex]

        if(collectionMonst.inTeam){

            const teamMonstIndex = team.findIndex(i => i.surrogateID === surrogateID);

            if(teamMonstIndex === -1) {

                console.error("Monster was not put into team: ", surrogateID, " it can not have Damage dealt actively in battle!")

                return null;

            } else {

                const enemyMonstIndex = wildMons.findIndex(i => i.surrogateID === enemySurrogateID)

                if(enemyMonstIndex === -1){

                    console.error("Supposedly attacking Monster ", enemySurrogateID, " could not be found in wild Monsters.")

                    return null;

                }else{



                    const enemyMonst = wildMons[enemyMonstIndex]

                    enemyHealth = enemyMonst.health;

                    const teamMonst = team[teamMonstIndex];

                    ownHealth = teamMonst.health;





                }

            }

        }

    } //Möglichkeit um einfacher zu machen: einfach beim Funktionsaufruf die Art, also ob es eigenes Monster im team und Collection oder enemy Monster im wild (oder NPC Gegner) ist.



    export function dealPassiveOwnMonstDamage() {

    }