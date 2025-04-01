
import {
    RatingGroup,

} from '@chakra-ui/react';



const RatingInput = ({rating , size, isDisabled= false}) => {


    return ( 
         <RatingGroup.RootProvider value={rating}  size={size} mb={2}>
                <RatingGroup.HiddenInput />
                <RatingGroup.Control>
                    {rating.items.map((index) => (
                    <RatingGroup.Item key={index} index={index}
                    onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                    style={{
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.4 : 1,
                      pointerEvents: isDisabled ? 'none' : 'auto',
                    }}
                    > 
                        <RatingGroup.ItemIndicator />
                    </RatingGroup.Item>
                    ))}
                </RatingGroup.Control>
        </RatingGroup.RootProvider>
    )
};

export default RatingInput;
