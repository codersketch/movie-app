import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/usefetch";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/Appwrite";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const {
        data: movies,
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = useFetch(
        () =>
            fetchMovies({
                query: searchQuery,
            }),
        false
    );
    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
                // Here is the performance issue
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    
    useEffect(() => {
        // After seperating the performence issue solved
        // Call updateSearchCount only if there are results
        if (movies?.length! > 0 && movies?.[0]) {
            updateSearchCount(searchQuery, movies[0]);
        }
        // await updateSearchCount(searchQuery, movies[0]);
    }, [movies]);
    // console.log(movies);
    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="flex-1 absolute w-full z-0"
                resizeMode="cover"
            ></Image>
            <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: "center",
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image
                                source={icons.logo}
                                className="w-12 h-10"
                            ></Image>
                        </View>
                        <View className="my-5">
                            <SearchBar
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChangeText={(text: string) =>
                                    setSearchQuery(text)
                                }
                            />
                        </View>
                        {loading && (
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                                className="mt-10 self-center"
                            />
                        )}
                        {error && (
                            <Text className="text-red-500 py-5 my-3">
                                Error: {error.message}
                            </Text>
                        )}
                        {!loading &&
                            !error &&
                            searchQuery.trim() &&
                            movies?.length! > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search Results for{" "}
                                    <Text className="text-accent">
                                        {searchQuery}
                                    </Text>
                                </Text>
                            )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-5 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim()
                                    ? "No movies found"
                                    : "Search for a movie"}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;

const styles = StyleSheet.create({});
