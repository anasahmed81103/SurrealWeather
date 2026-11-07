/* ------------------------------------------------------------------
 * regionOf — country code → regional skyline style, for countries
 * without their own landmark. Anything not listed → "modernCity".
 * (Plain lists of ISO codes, easy to scan and move between groups.)
 * ------------------------------------------------------------------ */

const GROUPS = {
    europeTown:
        "GB IE FR ES PT DE NL BE LU CH AT IT DK NO SE FI IS PL CZ SK HU SI HR BA RS ME MK AL GR RO BG MT CY EE LV LT AD MC SM LI VA XK GE AM",
    orthodoxTown: "RU UA BY MD",
    islamicTown:
        "PK AF IR IQ SY JO LB PS SA AE QA BH KW OM YE EG LY TN DZ MA EH MR SD TR AZ UZ TM KZ KG TJ BD MV ID MY BN SO DJ NE ML SN GM GN KM",
    eastAsiaCity: "CN JP KR KP TW VN MN HK MO",
    templeCity: "TH LA KH MM LK NP BT IN",
    latinTown:
        "MX GT BZ SV HN NI CR PA CU DO HT PR CO VE EC PE BO CL AR UY PY BR GY SR",
    africaCity:
        "NG GH CI BF TD CM CF GA CG CD AO ZM ZW MZ MW TZ KE UG RW BI ET ER SS ZA NA BW LS SZ MG SL LR TG BJ GW CV GQ ST MU SC",
};

const REGION = {};
for (const [region, codes] of Object.entries(GROUPS)) {
    for (const cc of codes.split(" ")) REGION[cc] = region;
}

export const regionOf = (cc) => REGION[cc] || "modernCity";
