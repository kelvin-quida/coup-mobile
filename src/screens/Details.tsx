import { useEffect, useState } from "react";
import { Share } from "react-native";
import { HStack, useToast, VStack } from "native-base";
import { useRoute } from "@react-navigation/native";

import { api } from "../services/api";

import {Option} from '../components/Option'
import { Loading } from "../components/Loading";
import { Guesses } from "../components/Guesses";
import { Header } from "../components/Header";
import { PoolHeader } from "../components/PoolHeader";
import {PoolCardProps} from "../components/PoolCard" 
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";

interface RouteParams{
    id:String
}

export function Details(){
    const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses')
    const [isLoading,setIsLoading] = useState(true)
    const [poolDetails,setPoolDetails] = useState<PoolCardProps>({} as PoolCardProps)

    const route = useRoute()
    const toast = useToast()

    const {id} = route.params as RouteParams
    
    async function fetchPoolDetails() {   
        try {
            setIsLoading(true)

            const reponse = await api.get(`/pools/${id}`)
            setPoolDetails(reponse.data.pool)

        } catch (error) {
            console.log(error)

            toast.show({
                title:'Não foi possivel carregar os detalhes bolões',
                placement:'top',
                bgColor:'red.500',
            })
        }finally{
            setIsLoading(false)
        }
    }

    async function handleCodeShare() {
        await Share.share({
            message:poolDetails.code
        })
    }

    useEffect(() => {
        fetchPoolDetails()
    },[id])

    if(isLoading){
        return <Loading/>
    }

    return(
        <VStack flex={1} bgColor="gray.900">
            <Header 
                title={poolDetails.title} 
                showBackButton 
                showShareButton 
                onShare={handleCodeShare}
            />

            {
                poolDetails._count?.participants > 0 ?
                    <VStack px={5} flex={1}>
                        <PoolHeader data={poolDetails} />

                        <HStack bgColor='gray.800' px={1} rounded='sm' mb={5} >
                            <Option
                                title='Seus palpites'
                                isSelected={optionSelected === 'guesses'}
                                onPress={() => setOptionSelected('guesses')}
                            />

                            <Option
                                title='Ranking do Grupo'
                                isSelected={optionSelected === 'ranking'}
                                onPress={() => setOptionSelected('ranking')}
                            />

                        </HStack>

                        <Guesses poolId={poolDetails.id} code={poolDetails.code} />
                    </VStack>

                : <EmptyMyPoolList code={poolDetails.code} />
            }

        </VStack>
    )
}