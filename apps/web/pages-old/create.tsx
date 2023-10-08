import React from "react";
import { Pressable, Image, Text, View } from '../../../packages/app/components/design-system'

export type User = {
  username: string
  pkpPublicKey: string
  pkpEthAddress: string
//   sessionSigsMap: SessionSigsMap
  sessionExpiresAt: number
}

const user = {} as User
const image = ''

const UserHeader = ({user}: {user:User})=>  (<View className="p-3 flex headerbg">
        <Text>memewar.army</Text>
        <View className="flex-1"></View>
          <Pressable
            // onclick={async () => {
            //   await signOut();
            //   m.route.set("/sign-in");
            // }}
          >
            <Text>
            {user.username}
            </Text>
          </Pressable>
      </View>)

export default function App() {
  return (
    <View className="h-screen bg-[url('/img/main-bg.png')] flex flex-col">
        <UserHeader user={user}/>

        <View className="p-4 w-full flex-1 max-w-md mx-auto">
          {!image ? (
            <View>
              <Pressable
                className="w-full bg-prim-700 text-white px-4 py-2 rounded-sm"
                // onclick={() => {
                //   imageInput?.click();
                // }}
              >
                <Text>
                    Choose Image
                </Text>
              </Pressable>
              {/* <input
                id="imageInput"
                type="file"
                style={{ display: "none" }}
                // onchange={handleImageSelection}
                accept="image/*"
                // oncreate={({ dom }) => {
                //   imageInput = dom as HTMLInputElement;
                // }}
              /> */}

              <Text className="mt-2">
                By uploading, you confirm that you have permission to use this
                image.
              </Text>
            </View>
          ) : (
            <View>
              {/* <Image source={{uri: image}} /> */}

              <View className="mt-4 space-y-1">
                <View className="flex items-center space-x-2">
                  {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="23"
                    viewBox="0 0 23 23"
                    fill="none"
                  >
                    <path
                      d="M11.5 6.83333V11.5L15 15M22 11.5C22 12.8789 21.7284 14.2443 21.2007 15.5182C20.6731 16.7921 19.8996 17.9496 18.9246 18.9246C17.9496 19.8996 16.7921 20.6731 15.5182 21.2007C14.2443 21.7284 12.8789 22 11.5 22C10.1211 22 8.75574 21.7284 7.48182 21.2007C6.20791 20.6731 5.05039 19.8996 4.07538 18.9246C3.10036 17.9496 2.32694 16.7921 1.79926 15.5182C1.27159 14.2443 1 12.8789 1 11.5C1 8.71523 2.10625 6.04451 4.07538 4.07538C6.04451 2.10625 8.71523 1 11.5 1C14.2848 1 16.9555 2.10625 18.9246 4.07538C20.8938 6.04451 22 8.71523 22 11.5Z"
                      stroke="black"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg> */}

                  <Text>12 hour sale</Text>
                </View>

                <View className="flex items-center space-x-2">
                  {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                  >
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="9.5"
                      stroke="black"
                      stroke-width="2"
                    />
                    <path
                      d="M6.63086 10.6759L10.4998 3.6207L14.3688 10.6759L10.4998 12.8379L6.63086 10.6759Z"
                      fill="black"
                    />
                    <path
                      d="M10.4998 17.0483L6.51709 11.2448L10.4998 13.6345L14.4826 11.2448L10.4998 17.0483Z"
                      fill="black"
                    />
                  </svg> */}

                  <Text>0.001 ETH each ($1.60)</Text>
                </View>
              </View>

              <Pressable
                className="mt-6 w-full bg-prim-700 text-white px-4 py-2 rounded-sm"
                // onclick={createMeme}
              >
                <Text>
                Create meme
                </Text>
              </Pressable>

              <View className="mt-4">
                <View className="pl-6 list-disc">
                  <Text>Collectors have 12 hours to mint</Text>
                  <Text>Each addition costs 0.001 eth</Text>
                  <Text>You are the sole owner of your NFT contract</Text>
                  <Text>
                    A 0.00005 eth (~$0.08) fee applies to each edition sold
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* TODO: tabs */}
        {/* <View className="w-full max-w-md self-center">{m(TabBar)}</View> */}
      </View>
  );
}
