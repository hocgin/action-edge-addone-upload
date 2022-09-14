import {EdgeAddonsAPI} from "@plasmohq/edge-addons-api"
import {debugPrintf, Inputs, Outputs} from "./main";

export function run(input: Inputs): Outputs {
    const client = new EdgeAddonsAPI({
        productId: input.product_id,
        clientId: input.client_id,
        clientSecret: input.client_secret,
        accessTokenUrl: input.access_token_url
    })
    client.submit({
        filePath: input.addone_file,
        notes: input.notes
    }).then(debugPrintf).catch(debugPrintf);

    client.publish()
    return {};
}
