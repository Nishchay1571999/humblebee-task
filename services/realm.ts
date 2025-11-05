import Realm from "realm";


export const FarmerSubmissionSchema: Realm.ObjectSchema = {
    name: "FarmerSubmission",
    primaryKey: "_id",
    properties: {
        _id: "string",
        farmerName: "string",
        contactNumber: "string",
        gender: "string",
        state: "string",
        district: "string",
        blockName: "string",
        streetName: "string",
        plotName: "string",
        createdAt: "date",
    },
};


const SCHEMA_VERSION = 1;

let realmInstance: Realm | null = null;

export async function openRealm(): Promise<Realm> {
    if (realmInstance && !realmInstance.isClosed) {
        return realmInstance;
    }

    realmInstance = await Realm.open({
        schema: [FarmerSubmissionSchema],
        schemaVersion: SCHEMA_VERSION,
        migration: (oldRealm: any, newRealm: any) => {
            console.log(oldRealm, newRealm);

        },
    });

    return realmInstance;
}


export function closeRealm() {
    if (realmInstance && !realmInstance.isClosed) {
        realmInstance.close();
    }
    realmInstance = null;
}

export async function saveFarmerSubmission(data: {
    farmerName: string;
    contactNumber: string;
    gender: string;
    state: string;
    district: string;
    blockName: string;
    streetName: string;
    plotName: string;
}) {
    const realm = await openRealm();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    realm.write(() => {
        realm.create("FarmerSubmission", {
            _id: id,
            ...data,
            createdAt: new Date(),
        });
    });
    return id;
}


export async function getAllFarmerSubmissions() {
    const realm = await openRealm();
    const objs = realm.objects("FarmerSubmission");
    // convert to plain JS array
    return objs.map((o: any) => ({
        _id: o._id,
        farmerName: o.farmerName,
        contactNumber: o.contactNumber,
        gender: o.gender,
        state: o.state,
        district: o.district,
        blockName: o.blockName,
        streetName: o.streetName,
        plotName: o.plotName,
        createdAt: o.createdAt,
    }));
}
