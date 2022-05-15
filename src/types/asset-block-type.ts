export type TAssetBlockType = "change#mint" | // #mint
                              "send#mint" |
                              "send#asset" | // #asset
                              "receive#asset" |
                              "send#burn" | // #burn
                              "send#atomic_swap" | // #atomic_swap
                              "receive#atomic_swap" |
                              "send#abort_receive_atomic_swap" | // #abort_receive_atomic_swap
                              "change#abort_receive_atomic_swap" |
                              "receive#abort_receive_atomic_swap" |
                              "send#abort_payment" | // #abort_payment
                              "change#abort_payment" |
                              "receive#abort_payment" |
                              "send#payment" | // #payment
                              "send#atomic_swap_delegation" | // #atomic_swap_delegation
                              "send#returned_to_sender" |
                              "receive#atomic_swap_delegation" |
                              "send#abort_delegation" | // #abort_delegation
                              "receive#abort_delegation" |
                              "change#abort_delegation";
                              
                              
