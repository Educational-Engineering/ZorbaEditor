jsoniq version "1.0";
import module namespace mongo2="http://www.zorba-xquery.com/modules/mongo2";
[
 let $s1 := mongo2:query({
"host":"ds049651.mongolab.com:49651",
"user":"sichaud",
"userSource" : "etbackend",
"pwd" : "123test"
}, "etbackend.studentappointments", "{}")


    for $item in $s1
    let $r := $item.uebungsNr
    group by $r
    return {
         "label" : $r,
         "data1" : count($item.userName1)
    }
]
