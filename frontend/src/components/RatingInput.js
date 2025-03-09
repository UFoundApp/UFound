
import {
    RatingGroup,

} from '@chakra-ui/react';



const RatingInput = ({rating , size}) => {


    return ( 
         <RatingGroup.RootProvider value={rating}  size={size} mb={2}>
                <RatingGroup.HiddenInput />
                <RatingGroup.Control>
                    {rating.items.map((index) => (
                    <RatingGroup.Item key={index} index={index}>
                        <RatingGroup.ItemIndicator />
                    </RatingGroup.Item>
                    ))}
                </RatingGroup.Control>
        </RatingGroup.RootProvider>
    )
};

export default RatingInput;
